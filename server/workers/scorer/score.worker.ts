import { db } from '../../../src/db/index';
import { audits, ruleVersions, marketSnapshots, scoreAnalysis, gemListings } from '../../../src/db/schema';
import { eq, and, ne } from 'drizzle-orm';

const CALCULATION_VERSION = 'gem-intel-scorer@1.0.0';

/**
 * Executes the SCORE phase of the audit pipeline.
 * Contains ZERO LLM calls. Pure deterministic math based on frozen rules.
 */
export async function runScoreWorker(auditId: string) {
  console.log(`[Score Worker] Starting SCORE for audit ${auditId}`);

  // 1. Load the exact frozen Audit state
  const [audit] = await db.select().from(audits).where(eq(audits.id, auditId));
  if (!audit) throw new Error(`Audit ${auditId} not found`);
  if (!audit.rulesVersionId) throw new Error(`Audit ${auditId} is missing rulesVersionId`);

  // 2. Load the exact immutable Rule Version attached to this audit
  const [rules] = await db.select().from(ruleVersions).where(eq(ruleVersions.id, audit.rulesVersionId));
  if (!rules) throw new Error(`Rules version ${audit.rulesVersionId} not found`);

  // 3. Load the GeM Listing target price
  const [listing] = await db.select().from(gemListings).where(eq(gemListings.id, audit.gemListingId));
  if (!listing) throw new Error(`Listing not found for audit`);
  
  const targetPrice = parseFloat(listing.listedPrice);

  // 4. Load all valid, non-simulated market snapshots for this audit
  // Note: For simplicity in prototype, we're fetching all. In production, we'd ensure they belong to this audit execution.
  const snapshots = await db.select()
    .from(marketSnapshots)
    .where(
      and(
        eq(marketSnapshots.auditId, auditId),
        eq(marketSnapshots.isSimulated, false) // STRICT ENFORCEMENT: Ignore simulated data
      )
    );

  // 5. Pre-process snapshots to calculate landed cost & filter by spec threshold
  const validPrices: number[] = [];
  const inputSnapshotIds: string[] = [];
  let minObservedSpecScore: number | null = null;
  const resultDetails: string[] = [];

  const minSpecConfidence = parseFloat(rules.minSpecMatchConfidence);

  for (const snap of snapshots) {
    if (!snap.basePrice || !snap.specMatchScore) {
      resultDetails.push(`Snapshot ${snap.id}: Discarded due to missing price or spec score.`);
      continue;
    }

    const specScore = parseFloat(snap.specMatchScore);
    
    // Update minimum observed spec score for the audit record
    if (minObservedSpecScore === null || specScore < minObservedSpecScore) {
      minObservedSpecScore = specScore;
    }

    // Spec Matching gate based on rules
    if (specScore < minSpecConfidence) {
      resultDetails.push(`Snapshot ${snap.id}: Discarded. Spec score ${specScore} is below threshold ${minSpecConfidence}.`);
      continue;
    }

    // Calculate Landed Cost deterministically
    const base = parseFloat(snap.basePrice);
    const tax = snap.taxPct ? (base * parseFloat(snap.taxPct)) / 100 : 0;
    const freight = snap.freight ? parseFloat(snap.freight) : 0;
    const warranty = snap.warrantyValue ? parseFloat(snap.warrantyValue) : 0;
    
    const landedCost = base + tax + freight + warranty;

    // Persist landed cost back to the snapshot (since we just computed it)
    await db.update(marketSnapshots).set({
      landedCost: landedCost.toString()
    }).where(eq(marketSnapshots.id, snap.id));

    validPrices.push(landedCost);
    inputSnapshotIds.push(snap.id);
  }

  // 6. Calculate Fair Market Value (Median)
  let fmv: number | null = null;
  let priceVariancePct: number | null = null;
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | null = null;

  if (validPrices.length === 0) {
    // FAIL CLOSED: Insufficient evidence
    resultDetails.push("FAIL CLOSED: No valid snapshots met the criteria for FMV calculation.");
    riskLevel = 'HIGH'; // Manual review required due to lack of evidence
  } else {
    // Median Calculation
    validPrices.sort((a, b) => a - b);
    const mid = Math.floor(validPrices.length / 2);
    fmv = validPrices.length % 2 !== 0 
      ? validPrices[mid] 
      : (validPrices[mid - 1] + validPrices[mid]) / 2;

    // 7. Calculate Variance vs Target
    // ((target - fmv) / fmv) * 100
    priceVariancePct = ((targetPrice - fmv) / fmv) * 100;

    // 8. Risk Classification based on Rules
    const blockThreshold = parseFloat(rules.blockOrderThresholdPct);
    const flagThreshold = parseFloat(rules.autoFlagVariancePct);

    if (priceVariancePct > blockThreshold) {
      riskLevel = 'HIGH';
      resultDetails.push(`HIGH RISK: Variance ${priceVariancePct.toFixed(2)}% exceeds block threshold ${blockThreshold}%`);
    } else if (priceVariancePct > flagThreshold) {
      riskLevel = 'MEDIUM';
      resultDetails.push(`MEDIUM RISK: Variance ${priceVariancePct.toFixed(2)}% exceeds flag threshold ${flagThreshold}%`);
    } else {
      riskLevel = 'LOW';
      resultDetails.push(`LOW RISK: Variance ${priceVariancePct.toFixed(2)}% is within normal bounds.`);
    }
  }

  // Check overall spec failure for the entire audit (if the best evidence was still garbage)
  if (minObservedSpecScore !== null && minObservedSpecScore < minSpecConfidence) {
     riskLevel = 'HIGH';
     resultDetails.push(`HIGH RISK: Minimum observed spec match score (${minObservedSpecScore}) was below required threshold (${minSpecConfidence}).`);
  }

  const resultJson = {
    details: resultDetails,
    targetPrice,
    evidenceCount: validPrices.length,
    specThresholdPassed: (minObservedSpecScore !== null && minObservedSpecScore >= minSpecConfidence),
    evidenceSufficient: validPrices.length > 0,
    requiresOfficerReview: riskLevel === 'HIGH' || riskLevel === 'MEDIUM'
  };

  // 9. Record Deterministic Provenance
  await db.insert(scoreAnalysis).values({
    auditId,
    rulesVersionId: rules.id,
    inputSnapshotIds,
    fmv: fmv ? fmv.toFixed(2) : null,
    priceVariancePct: priceVariancePct ? priceVariancePct.toFixed(2) : null,
    minSpecMatchScore: minObservedSpecScore ? minObservedSpecScore.toString() : null,
    riskLevel,
    calculationVersion: CALCULATION_VERSION,
    resultJson,
  });

  // 10. Advance Audit State
  // Notice we ONLY set IN_REVIEW, not COMPLIANT. Code proposes, Officer decides.
  await db.update(audits).set({
    status: 'IN_REVIEW',
    fmv: fmv ? fmv.toFixed(2) : null,
    priceVariancePct: priceVariancePct ? priceVariancePct.toFixed(2) : null,
    riskLevel: riskLevel,
    minSpecMatchScore: minObservedSpecScore ? minObservedSpecScore.toString() : null,
    updatedAt: new Date()
  }).where(eq(audits.id, auditId));

  console.log(`[Score Worker] Completed successfully. Resulted in ${riskLevel} risk.`);
}
