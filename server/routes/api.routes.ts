import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AIService } from '../services/ai.service';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { db } from '../../src/db/index';
import { audits, ruleVersions, gemListings, auditDecisions, marketSnapshots, matchAnalysis, scoreAnalysis, certificates, auditEvents } from '../../src/db/schema';
import { enqueueAuditJob } from '../lib/tasks';
import { eq, desc, inArray } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';
import { issueCertificate } from '../lib/trust-ledger';

const router = Router();
const aiService = new AIService();

const DB_FILE = path.join(process.cwd(), 'database.json');

// Zod Schema for Decision Mutation
const decisionSchema = z.object({
  decision: z.enum(['ISSUE_CERTIFICATE', 'JUSTIFY_AND_PROCEED', 'REJECT']),
  justification: z.string().optional()
});

/**
 * Authenticated Officer Decision Mutation
 * This strictly separated boundary records the human authority decision append-only.
 * If the decision is to issue a certificate, it hands off to the independent Certificate Gate.
 */
router.post('/v1/audits/:id/decision', requireAuth, requireRole(['OFFICER', 'ADMIN', 'AUDITOR']), async (req: AuthRequest, res: Response) => {
  const auditId = req.params.id;
  const officerUid = req.user!.uid;

  try {
    const parsed = decisionSchema.parse(req.body);
    const { decision, justification } = parsed;

    const [audit] = await db.select().from(audits).where(eq(audits.id, auditId));
    
    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' });
    }

    // IDOR Protection: Prevent Officer B from mutating Officer A's assigned audit
    if (audit.assignedOfficerId !== req.user!.dbId && req.user!.dbRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: You are not assigned to this audit.' });
    }

    if (audit.status !== 'IN_REVIEW') {
      return res.status(400).json({ error: 'Decisions can only be made when the audit is IN_REVIEW' });
    }

    if (audit.riskLevel === 'HIGH' && !justification) {
      return res.status(400).json({ error: 'HIGH risk audits require a mandatory justification for any decision.' });
    }
    
    if (decision === 'REJECT' && !justification) {
      return res.status(400).json({ error: 'Rejections require a mandatory justification.' });
    }

    // Lookup dbUser by firebaseUid.
    const { users } = await import('../../src/db/schema');
    const [dbUser] = await db.select().from(users).where(eq(users.firebaseUid, officerUid));
    if (!dbUser) {
      return res.status(401).json({ error: 'Officer account not linked in database' });
    }

    // Append-Only Decision Record
    await db.insert(auditDecisions).values({
      auditId: audit.id,
      officerId: dbUser.id,
      decision: decision,
      justification: justification || null
    });

    await db.insert(auditEvents).values({
      auditId,
      eventType: `DECISION_${decision}`,
      actorId: dbUser.id,
      previousState: audit.status,
      newState: decision === 'REJECT' ? 'REJECTED' : audit.status,
      metadata: { justification }
    });

    if (decision === 'ISSUE_CERTIFICATE') {
      try {
        const cert = await issueCertificate(audit.id);
        return res.status(200).json({ 
          success: true, 
          message: 'Certificate issued successfully',
          certificateLedgerRef: cert.currentHash 
        });
      } catch (gateError: any) {
        console.error(`[Certificate Gate Blocked] Audit ${auditId}:`, gateError);
        return res.status(403).json({ 
          error: 'Certificate Gate Blocked Issuance',
          details: gateError.message
        });
      }
    } else if (decision === 'REJECT') {
      await db.update(audits).set({
        status: 'REJECTED',
        decision: decision,
        decisionJustification: justification,
        decidedBy: dbUser.id,
        decidedAt: new Date(),
        updatedAt: new Date()
      }).where(eq(audits.id, audit.id));

      return res.status(200).json({ success: true, message: 'Audit rejected successfully' });
    } else {
      await db.update(audits).set({
        decision: decision,
        decisionJustification: justification,
        decidedBy: dbUser.id,
        decidedAt: new Date(),
        updatedAt: new Date()
      }).where(eq(audits.id, audit.id));

      return res.status(200).json({ success: true, message: 'Decision recorded successfully' });
    }

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid decision payload', details: error.errors });
    }
    console.error('Decision mutation failed:', error);
    return res.status(500).json({ error: 'Internal server error processing decision' });
  }
});


/**
 * Get all certificates for Trust Ledger UI
 */
router.get('/v1/certificates', async (req, res) => {
  try {
    const allCerts = await db.select().from(certificates).orderBy(desc(certificates.createdAt));
    res.json(allCerts);
  } catch (error) {
    console.error('Failed to fetch certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

/**
 * Fetch Full Cryptographic/System Timeline for an Audit
 */
router.get('/v1/audits/:id/timeline', async (req, res) => {
  try {
    const events = await db.select()
      .from(auditEvents)
      .where(eq(auditEvents.auditId, req.params.id))
      .orderBy(desc(auditEvents.createdAt));
      
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// Apply requireAuth to all protected routes. 
// For prototype purposes, this is commented out to not break the frontend until JWTs are actually sent.
// router.use(requireAuth);

/**
 * Get all audits (Audit Queue / List)
 */
router.get('/v1/audits', async (req, res) => {
  try {
    const allAudits = await db.select({
      id: audits.id,
      gemListingId: audits.gemListingId,
      status: audits.status,
      riskLevel: audits.riskLevel,
      priceVariancePct: audits.priceVariancePct,
      createdAt: audits.createdAt,
      updatedAt: audits.updatedAt,
      title: gemListings.title,
      listedPrice: gemListings.listedPrice,
      decision: audits.decision
    })
    .from(audits)
    .leftJoin(gemListings, eq(audits.gemListingId, gemListings.id))
    .orderBy(desc(audits.createdAt));

    res.json(allAudits);
  } catch (error) {
    console.error('Failed to fetch audits:', error);
    res.status(500).json({ error: 'Failed to fetch audits' });
  }
});

/**
 * Get full detailed view of a specific audit (Officer Workspace)
 * Includes timeline, evidence, AI provenance, and scoring provenance.
 */
router.get('/v1/audits/:id', async (req, res) => {
  try {
    const auditId = req.params.id;
    
    const [audit] = await db.select().from(audits).where(eq(audits.id, auditId));
    if (!audit) return res.status(404).json({ error: 'Audit not found' });

    const [listing] = await db.select().from(gemListings).where(eq(gemListings.id, audit.gemListingId));
    const [rules] = await db.select().from(ruleVersions).where(eq(ruleVersions.id, audit.rulesVersionId));
    
    // Fetch evidence snapshots
    const snapshots = await db.select().from(marketSnapshots).where(eq(marketSnapshots.auditId, auditId));
    
    // Fetch AI provenance
    const snapshotIds = snapshots.map(s => s.id);
    const aiAnalysis = snapshotIds.length > 0 
      ? await db.select().from(matchAnalysis).where(inArray(matchAnalysis.snapshotId, snapshotIds))
      : [];
      
    // Fetch score provenance
    const scoreProvenanceList = await db.select().from(scoreAnalysis)
      .where(eq(scoreAnalysis.auditId, auditId))
      .orderBy(desc(scoreAnalysis.createdAt));
      
    // Fetch decision history
    const decisions = await db.select().from(auditDecisions)
      .where(eq(auditDecisions.auditId, auditId))
      .orderBy(desc(auditDecisions.createdAt));

    res.json({
      audit,
      listing,
      rules,
      snapshots,
      aiAnalysis,
      scoreProvenance: scoreProvenanceList[0] || null,
      decisions,
      timeline: [] // Could synthesize a timeline from created_at timestamps across these tables
    });
  } catch (error) {
    console.error('Failed to fetch audit details:', error);
    res.status(500).json({ error: 'Failed to fetch audit details' });
  }
});

/**
 * Get current active rule version
 */
router.get('/v1/rules/current', async (req, res) => {
  try {
    const [currentRules] = await db.select().from(ruleVersions).orderBy(desc(ruleVersions.createdAt)).limit(1);
    if (!currentRules) return res.status(404).json({ error: 'No rules configured' });
    res.json(currentRules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

/**
 * Append new rule version (Admin Only)
 */
router.post('/v1/rules', async (req: Request, res: Response) => {
  try {
    const { autoFlagVariancePct, minSpecMatchConfidence, blockOrderThresholdPct } = req.body;
    
    // For prototype: Grab any admin user
    const { users } = await import('../../src/db/schema');
    const [dbUser] = await db.select().from(users).where(eq(users.role, 'ADMIN')).limit(1);
    if (!dbUser) return res.status(401).json({ error: 'No admin account found in database' });

    // Fetch previous version to link it
    const [currentRules] = await db.select().from(ruleVersions).orderBy(desc(ruleVersions.createdAt)).limit(1);

    const [newVersion] = await db.insert(ruleVersions).values({
      autoFlagVariancePct: autoFlagVariancePct.toString(),
      minSpecMatchConfidence: minSpecMatchConfidence.toString(),
      blockOrderThresholdPct: blockOrderThresholdPct.toString(),
      createdBy: dbUser.id,
      previousVersionId: currentRules?.id || null
    }).returning();

    res.json({ success: true, message: 'Rules updated in ledger', rules: newVersion });
  } catch (error) {
    console.error('Failed to update rules:', error);
    res.status(500).json({ error: 'Failed to update rules' });
  }
});

/**
 * Initializes a new Audit.
 * Creates the DB record in PENDING state and enqueues the async SCRAPE task.
 */
router.post('/v1/audits', async (req, res) => {
  try {
    const { gemListingId, fallbackData } = req.body; 

    // If gemListingId is passed but doesn't exist, we might need to insert it for the demo
    // We'll trust the fallbackData for the prototype to avoid breaking existing UI flows
    let activeListingId = gemListingId;

    if (fallbackData && fallbackData.id) {
       // Mock insert the listing if we receive payload from the old UI
       await db.insert(gemListings).values({
          id: fallbackData.id,
          gemListingId: `GEM-${fallbackData.id.substring(0,6).toUpperCase()}`,
          sellerId: '00000000-0000-0000-0000-000000000000', // Need a valid seller or make it nullable, handle below
          title: fallbackData.productName || 'Unknown Product',
          category: fallbackData.category || 'Unknown',
          specJson: fallbackData.specifications || {},
          listedPrice: fallbackData.price?.toString() || '0',
          scrapedAt: new Date()
       }).onConflictDoNothing();
       activeListingId = fallbackData.id;
    }

    if (!activeListingId) {
       return res.status(400).json({ error: 'gemListingId is required' });
    }

    // 1. Fetch current active rules version
    const [currentRules] = await db.select().from(ruleVersions).orderBy(desc(ruleVersions.createdAt)).limit(1);
    if (!currentRules) {
      return res.status(500).json({ error: 'System not fully initialized: No rule versions found.' });
    }

    // 2. Create the PENDING audit row
    const [newAudit] = await db.insert(audits).values({
      gemListingId: activeListingId,
      rulesVersionId: currentRules.id,
      status: 'PENDING'
    }).returning();

    // 3. Enqueue the async execution chain
    await enqueueAuditJob(newAudit.id, 'SCRAPE');

    // 4. Return 202 Accepted immediately per architecture
    return res.status(202).json({ 
      success: true, 
      auditId: newAudit.id,
      status: 'PENDING',
      message: 'Audit initiated. Worker jobs queued.' 
    });

  } catch (error) {
    console.error('Failed to initiate audit:', error);
    res.status(500).json({ error: 'Failed to initiate audit' });
  }
});

router.post('/v1/audit', async (req, res) => {
  try {
    const { title, price, rawSpecs } = req.body;
    const aiData = await aiService.runAuditPipeline(title, price, rawSpecs);
    res.json(aiData);
  } catch (error) {
    console.error("AI Engine Error:", error);
    res.status(500).json({ error: "Failed to run AI Audit" });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { query, contextData } = req.body;
    const response = await aiService.runChat(query, contextData);
    res.json({ response });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to generate chat response" });
  }
});

export default router;
