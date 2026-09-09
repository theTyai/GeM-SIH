import { GoogleGenAI, Type, Schema } from '@google/genai';
import { db } from '../../../src/db/index';
import { audits, marketSnapshots, ruleVersions, gemListings, matchAnalysis } from '../../../src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { matchResultSchema } from './schema';
import crypto from 'crypto';

// Initialize the Google GenAI SDK
const ai = new GoogleGenAI(); // Assumes GEMINI_API_KEY is in environment

const MODEL = 'gemini-2.5-pro';
const PROMPT_VERSION = 'v1.0.0-spec-matcher';

/**
 * Executes the MATCH phase of the audit pipeline.
 * Deterministically binds the audit rules, frozen snapshot, and target specs.
 * Uses structured output (JSON Schema) to guarantee parseable AI results.
 */
export async function runMatchWorker(auditId: string) {
  console.log(`[Match Worker] Starting MATCH for audit ${auditId}`);

  // 1. Load the exact frozen Audit state
  const [audit] = await db.select().from(audits).where(eq(audits.id, auditId));
  if (!audit) throw new Error(`Audit ${auditId} not found`);
  if (!audit.rulesVersionId) throw new Error(`Audit ${auditId} is missing rulesVersionId`);

  // 2. Load the exact immutable Rule Version attached to this audit
  const [rules] = await db.select().from(ruleVersions).where(eq(ruleVersions.id, audit.rulesVersionId));
  if (!rules) throw new Error(`Rules version ${audit.rulesVersionId} not found`);

  // 3. Load the Target Spec from the GeM Listing
  const [listing] = await db.select().from(gemListings).where(eq(gemListings.id, audit.gemListingId));
  if (!listing) throw new Error(`Listing not found for audit`);

  // 4. Load the pending Market Snapshots (evidence)
  // In a real flow, we might have multiple snapshots. For now, grab the latest for this audit.
  const [snapshot] = await db.select()
    .from(marketSnapshots)
    .where(eq(marketSnapshots.auditId, auditId))
    .orderBy(desc(marketSnapshots.scrapedAt))
    .limit(1);

  if (!snapshot) {
    throw new Error(`No immutable market evidence found for audit ${auditId}`);
  }
  if (!snapshot.evidenceSha256 || !snapshot.evidenceObjectKey) {
    throw new Error(`Snapshot ${snapshot.id} is invalid: missing WORM evidence anchors`);
  }

  // 5. Retrieve Evidence Payload
  // In production, we would stream the raw HTML/text from the GCS `evidenceObjectKey` bucket.
  // For the prototype (where we might not have the actual GCS bucket wired in dev), 
  // we will simulate the evidence text. But the architectural boundary holds: 
  // we pass the known evidence, NOT allowing Gemini to search the web dynamically.
  const evidenceText = `
    [SIMULATED RAW HTML TEXT EXTRACTED FROM ${snapshot.sourceUrl}]
    Product: ${listing.title}
    Price: ₹45,000
    RAM: 16 GB DDR4
    Processor: Core i5 12th Gen
    Storage: 512GB NVMe SSD
  `;

  // 6. Construct Deterministic Prompt Context
  const promptContext = `
    You are an expert procurement auditor. Your job is to extract product specifications from raw market evidence and compare them strictly against a target specification.
    
    TARGET SPECIFICATION (Required):
    ${JSON.stringify(listing.specJson, null, 2)}
    
    MARKET EVIDENCE TEXT (Immutable Snapshot ${snapshot.evidenceSha256}):
    ${evidenceText}
    
    INSTRUCTIONS:
    1. Analyze the MARKET EVIDENCE.
    2. Extract the base price if visible.
    3. Compare the found attributes against the TARGET SPECIFICATION.
    4. Calculate a spec_match_score from 0 to 100 based on how closely the evidence matches the target.
    5. Return the result strictly in the requested JSON structure. Do not hallucinate data. If an attribute is missing in the evidence, put it in 'unknown_attributes'.
  `;

  console.log(`[Match Worker] Invoking ${MODEL} structured generation...`);

  // 7. Invoke Gemini with Strict JSON Schema
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: promptContext,
    config: {
      temperature: 0.1, // Low temperature for deterministic extraction
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          spec_match_score: { type: Type.NUMBER },
          matched_attributes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                attribute: { type: Type.STRING },
                target: { type: Type.STRING },
                observed: { type: Type.STRING },
                match: { type: Type.BOOLEAN },
              },
              required: ["attribute", "target", "observed", "match"]
            }
          },
          mismatches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                attribute: { type: Type.STRING },
                target: { type: Type.STRING },
                observed: { type: Type.STRING },
                match: { type: Type.BOOLEAN },
              },
              required: ["attribute", "target", "observed", "match"]
            }
          },
          unknown_attributes: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          confidence: { type: Type.NUMBER },
          extracted_price: { type: Type.NUMBER, nullable: true }
        },
        required: ["spec_match_score", "matched_attributes", "mismatches", "unknown_attributes", "confidence"]
      }
    }
  });

  const rawJsonString = response.text || "{}";

  // 8. Hash the Exact Response
  const responseHash = crypto.createHash('sha256').update(rawJsonString).digest('hex');

  // 9. Zod Validation (Guards against model schema drift or hallucinated structures)
  let parsedResult;
  try {
    const rawObj = JSON.parse(rawJsonString);
    parsedResult = matchResultSchema.parse(rawObj);
  } catch (err) {
    console.error(`[Match Worker] Invalid AI response structure:`, err);
    throw new Error('AI output failed Zod validation');
  }

  // 10. Persist AI Provenance
  await db.insert(matchAnalysis).values({
    snapshotId: snapshot.id,
    rulesVersionId: rules.id,
    model: MODEL,
    promptVersion: PROMPT_VERSION,
    responseHash: responseHash,
    specMatchScore: parsedResult.spec_match_score.toString(),
    resultJson: parsedResult,
  });

  // 11. Update Market Snapshot with Extracted Data
  await db.update(marketSnapshots).set({
    specMatchScore: parsedResult.spec_match_score.toString(),
    specJson: parsedResult,
    basePrice: parsedResult.extracted_price ? parsedResult.extracted_price.toString() : null,
  }).where(eq(marketSnapshots.id, snapshot.id));

  console.log(`[Match Worker] Completed successfully. Score: ${parsedResult.spec_match_score}`);
}
