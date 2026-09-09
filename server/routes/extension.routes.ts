import { Router } from 'express';
import { db } from '../../src/db/index';
import { audits, gemListings, marketSnapshots, scoreAnalysis, auditEvents } from '../../src/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { enqueueAuditJob } from '../lib/tasks';
import crypto from 'crypto';

const router = Router();

// In a real production environment, requireAuth would be used here, validating Firebase ID tokens 
// sent by the extension. For prototype/demo, we assume implicit auth or a mock user.
// router.use(requireAuth);

/**
 * 1. Initialize Audit from Extension
 * Receives lightweight context from the DOM, creates the target listing, and enqueues the async pipeline.
 */
router.post('/v1/extension/analyze', async (req, res) => {
  try {
    const { productId, title, price, url, rawSpecs } = req.body;

    if (!productId || !title || price === undefined) {
      return res.status(400).json({ error: 'Missing required listing data (productId, title, price)' });
    }

    // Insert or update the target listing
    const listingId = crypto.randomUUID();
    await db.insert(gemListings).values({
      id: listingId,
      gemListingId: productId,
      sellerId: '00000000-0000-0000-0000-000000000000', // Mock seller for demo
      title,
      category: 'Uncategorized',
      listedPrice: price.toString(),
      specJson: rawSpecs || {},
      scrapedAt: new Date()
    }).onConflictDoNothing();

    // Find active rules
    const { ruleVersions } = await import('../../src/db/schema');
    const [currentRules] = await db.select().from(ruleVersions).orderBy(desc(ruleVersions.createdAt)).limit(1);
    
    if (!currentRules) {
      return res.status(500).json({ error: 'System not initialized: Missing rules.' });
    }

    // Create Audit
    const [newAudit] = await db.insert(audits).values({
      gemListingId: listingId,
      rulesVersionId: currentRules.id,
      status: 'PENDING'
    }).returning();

    // Enqueue SCRAPE worker
    await enqueueAuditJob(newAudit.id, 'SCRAPE');

    return res.status(202).json({
      success: true,
      auditId: newAudit.id,
      status: 'PENDING',
      message: 'Analysis pipeline triggered.'
    });

  } catch (error: any) {
    console.error('[Extension BFF] Analyze failed:', error);
    res.status(500).json({ error: 'Failed to trigger analysis', details: error.message, stack: error.stack });
  }
});

/**
 * 2. Poll Status
 * Lightweight endpoint for the extension to track the state machine.
 */
router.get('/v1/extension/audits/:id/status', async (req, res) => {
  try {
    const auditId = req.params.id;
    const [audit] = await db.select({ status: audits.status }).from(audits).where(eq(audits.id, auditId));
    
    if (!audit) return res.status(404).json({ error: 'Audit not found' });
    
    res.json({ auditId, status: audit.status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

/**
 * 3. Fetch Summary (Risk Card Data)
 * Returns only the intelligence needed for the extension's Risk Card.
 */
router.get('/v1/extension/audits/:id/summary', async (req, res) => {
  try {
    const auditId = req.params.id;
    const [audit] = await db.select().from(audits).where(eq(audits.id, auditId));
    if (!audit) return res.status(404).json({ error: 'Audit not found' });

    const [listing] = await db.select().from(gemListings).where(eq(gemListings.id, audit.gemListingId));
    const [score] = await db.select().from(scoreAnalysis).where(eq(scoreAnalysis.auditId, auditId)).orderBy(desc(scoreAnalysis.createdAt)).limit(1);

    const { ruleVersions } = await import('../../src/db/schema');
    const [rules] = await db.select({ id: ruleVersions.id }).from(ruleVersions).where(eq(ruleVersions.id, audit.rulesVersionId));

    res.json({
      auditId,
      status: audit.status,
      targetPrice: listing?.listedPrice || 0,
      riskLevel: audit.riskLevel || score?.riskLevel || 'PENDING',
      fmv: score?.fmv || 0,
      variancePct: audit.priceVariancePct || score?.priceVariancePct || '0',
      specMatchScore: score?.minSpecMatchScore || '0',
      rulesVersion: rules?.id || 'Unknown',
      certificateHash: audit.certificateLedgerRef || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

/**
 * 4. Fetch Evidence Integrity
 * Returns the SHA-256 hashes for the extension to display cryptographic proof.
 */
router.get('/v1/extension/audits/:id/evidence', async (req, res) => {
  try {
    const auditId = req.params.id;
    const snaps = await db.select({
      platform: marketSnapshots.sourcePlatform,
      hash: marketSnapshots.evidenceSha256,
      timestamp: marketSnapshots.scrapedAt
    }).from(marketSnapshots).where(eq(marketSnapshots.auditId, auditId));

    res.json({
      verified: snaps.length > 0 && snaps.every(s => !!s.hash),
      snapshots: snaps
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
});

export default router;
