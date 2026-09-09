import { Router, Request, Response } from 'express';
import { requireInternalAuth } from '../middleware/internal-auth.middleware';
import { db } from '../../src/db/index';
import { audits, jobs, marketSnapshots, auditEvents } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';
import { enqueueAuditJob } from '../lib/tasks';
import { runScrapeWorker } from '../workers/scraper/scraper.worker';
import { runMatchWorker } from '../workers/matcher/match.worker';
import { runScoreWorker } from '../workers/scorer/score.worker';

const router = Router();

// Secure all internal routes
router.use(requireInternalAuth);

/**
 * Main execution handler for async audit tasks.
 * Validates idempotency, updates state machine, and routes to specific workers.
 */
router.post('/jobs/execute', async (req: Request, res: Response) => {
  const { auditId, jobType } = req.body;
  const taskId = req.headers['x-cloudtasks-taskname'] as string || `manual-${Date.now()}`;
  const attemptHeader = req.headers['x-cloudtasks-taskretrycount'];
  const attempt = attemptHeader ? parseInt(attemptHeader as string, 10) : 0;

  if (!auditId || !jobType) {
    return res.status(400).json({ error: 'Missing auditId or jobType' });
  }

  // Idempotency key should NOT include attempt. This ensures that if attempt 0 succeeded but
  // Cloud Tasks didn't get the ACK (so it retries as attempt 1), we don't rerun it!
  const idempotencyKey = `${auditId}-${jobType}`;

  try {
    let jobRecord;
    try {
      // 1. Idempotency Check & Job Registration
      const inserted = await db.insert(jobs).values({
        auditId,
        jobType,
        status: 'RUNNING',
        attempt,
        idempotencyKey,
        startedAt: new Date()
      }).onConflictDoNothing({ target: jobs.idempotencyKey }).returning();
      jobRecord = inserted[0];
    } catch (e) {
      console.error(e);
    }

    if (!jobRecord) {
      // If we didn't insert a record, the job exists. Check its state.
      const [existingJob] = await db.select().from(jobs).where(eq(jobs.idempotencyKey, idempotencyKey));
      
      if (existingJob.status === 'COMPLETED') {
        console.log(`[Idempotency] Job ${idempotencyKey} already completed. Bypassing.`);
        return res.status(200).json({ message: 'Idempotency key already completed. Bypassed.' });
      } else if (existingJob.status === 'RUNNING') {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (existingJob.updatedAt < fiveMinutesAgo) {
          console.log(`[Idempotency] Job ${idempotencyKey} is stale. Reclaiming.`);
          // Use optimistic concurrency control
          const [updated] = await db.update(jobs)
            .set({ attempt, updatedAt: new Date() })
            .where(and(eq(jobs.id, existingJob.id), eq(jobs.status, 'RUNNING')))
            .returning();
          
          if (updated) {
            jobRecord = updated;
          } else {
            return res.status(409).json({ error: 'Job was reclaimed by another worker.' });
          }
        } else {
          console.log(`[Idempotency] Job ${idempotencyKey} is currently active. Bypassing to avoid duplicate execution.`);
          return res.status(409).json({ error: 'Job is actively running.' });
        }
      } else if (existingJob.status === 'FAILED') {
        const cooldownAgo = new Date(Date.now() - 30 * 1000); // 30 seconds cooldown
        if (existingJob.updatedAt < cooldownAgo) {
          console.log(`[Idempotency] Job ${idempotencyKey} is FAILED and passed cooldown. Attempting to reclaim.`);
          const [updated] = await db.update(jobs)
            .set({ status: 'RUNNING', attempt, startedAt: new Date(), error: null, updatedAt: new Date() })
            .where(and(eq(jobs.id, existingJob.id), eq(jobs.status, 'FAILED')))
            .returning();
          
          if (updated) {
            jobRecord = updated;
          } else {
            console.log(`[Idempotency] Failed to acquire lock for FAILED job ${idempotencyKey}. Another worker reclaimed it.`);
            return res.status(409).json({ error: 'Job was reclaimed by another worker.' });
          }
        } else {
          console.log(`[Idempotency] Job ${idempotencyKey} failed too recently. Cooldown active.`);
          return res.status(429).json({ error: 'Job failed recently. Cooldown active.' });
        }
      }
    }

    if (!jobRecord) {
      return res.status(500).json({ error: 'Failed to acquire job lock' });
    }

    // 2. Fetch current audit state
    const [audit] = await db.select().from(audits).where(eq(audits.id, auditId));
    if (!audit) {
      throw new Error(`Audit ${auditId} not found`);
    }

    const logEvent = async (eventType: string, newState: string) => {
      await db.insert(auditEvents).values({
        auditId,
        eventType,
        jobId: jobRecord.id,
        previousState: audit.status,
        newState,
      });
    };

    // 3. State Machine & Work Execution
    if (jobType === 'SCRAPE') {
      if (audit.status !== 'PENDING' && audit.status !== 'SCRAPING') {
         console.log(`[State Machine] Cannot transition to SCRAPING from ${audit.status}`);
         return res.status(200).json({ message: 'Invalid state transition' });
      }
      
      if (audit.status !== 'SCRAPING') {
        await db.update(audits).set({ status: 'SCRAPING', updatedAt: new Date() }).where(eq(audits.id, auditId));
        await logEvent('SCRAPE_STARTED', 'SCRAPING');
      }
      
      // Execute immutable evidence capture
      await runScrapeWorker(auditId);
      
      await logEvent('EVIDENCE_CAPTURED', 'SCRAPING');
      await db.update(jobs).set({ status: 'COMPLETED', completedAt: new Date(), updatedAt: new Date() }).where(eq(jobs.id, jobRecord.id));
      await enqueueAuditJob(auditId, 'MATCH');
      
    } else if (jobType === 'MATCH') {
      if (audit.status !== 'SCRAPING' && audit.status !== 'MATCHING') {
         return res.status(200).json({ message: 'Invalid state transition' });
      }
      
      if (audit.status !== 'MATCHING') {
        await db.update(audits).set({ status: 'MATCHING', updatedAt: new Date() }).where(eq(audits.id, auditId));
        await logEvent('MATCH_STARTED', 'MATCHING');
      }
      
      // Execute Deterministic AI Specification Matcher
      await runMatchWorker(auditId);
      
      await logEvent('MATCH_COMPLETED', 'MATCHING');
      await db.update(jobs).set({ status: 'COMPLETED', completedAt: new Date(), updatedAt: new Date() }).where(eq(jobs.id, jobRecord.id));
      await enqueueAuditJob(auditId, 'SCORE');
      
    } else if (jobType === 'SCORE') {
      if (audit.status !== 'MATCHING' && audit.status !== 'SCORING') {
         return res.status(200).json({ message: 'Invalid state transition' });
      }

      if (audit.status !== 'SCORING') {
        await db.update(audits).set({ status: 'SCORING', updatedAt: new Date() }).where(eq(audits.id, auditId));
        await logEvent('SCORE_STARTED', 'SCORING');
      }
      
      // Execute Deterministic Risk Scoring
      await runScoreWorker(auditId);
      
      await db.update(audits).set({ status: 'IN_REVIEW', updatedAt: new Date() }).where(eq(audits.id, auditId));
      await logEvent('SCORE_COMPLETED', 'IN_REVIEW');
      
      await db.update(jobs).set({ status: 'COMPLETED', completedAt: new Date(), updatedAt: new Date() }).where(eq(jobs.id, jobRecord.id));
    } else {
      throw new Error(`Unknown job type: ${jobType}`);
    }

    return res.status(200).json({ success: true, jobType, auditId });
  } catch (error: any) {
    console.error(`[Worker Error] ${jobType} failed:`, error);
    
    // Attempt to mark job as failed
    try {
      await db.update(jobs).set({ 
         status: 'FAILED', 
         error: error.message,
         completedAt: new Date(),
         updatedAt: new Date()
       }).where(eq(jobs.idempotencyKey, idempotencyKey));
       
      await db.insert(auditEvents).values({
        auditId,
        eventType: `${jobType}_FAILED`,
        metadata: { error: error.message }
      });
    } catch(dbErr) {
      console.error('Failed to write failure state to DB', dbErr);
    }

    return res.status(500).json({ error: 'Internal worker execution failed' });
  }
});

export default router;
