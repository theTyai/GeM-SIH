const fs = require('fs');
let code = fs.readFileSync('server/routes/internal.routes.ts', 'utf8');

code = code.replace(
`      } else if (existingJob.status === 'RUNNING') {
        // If it's a retry and it's marked running, the previous attempt may have crashed or timed out.
        // We will only take over if it's considered stale (e.g. hasn't been updated in 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (existingJob.updatedAt < fiveMinutesAgo) {
          console.log(\`[Idempotency] Job \${idempotencyKey} is stale. Reclaiming.\`);
          const [updated] = await db.update(jobs).set({ attempt, updatedAt: new Date() }).where(eq(jobs.id, existingJob.id)).returning();
          jobRecord = updated;
        } else {
          console.log(\`[Idempotency] Job \${idempotencyKey} is currently active. Bypassing to avoid duplicate execution.\`);
          return res.status(409).json({ error: 'Job is actively running.' });
        }
      } else if (existingJob.status === 'FAILED') {
        // If it failed before, we try again.
        const [updated] = await db.update(jobs).set({ status: 'RUNNING', attempt, startedAt: new Date(), error: null, updatedAt: new Date() }).where(eq(jobs.id, existingJob.id)).returning();
        jobRecord = updated;
      }`,
`      } else if (existingJob.status === 'RUNNING') {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (existingJob.updatedAt < fiveMinutesAgo) {
          console.log(\`[Idempotency] Job \${idempotencyKey} is stale. Reclaiming.\`);
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
          console.log(\`[Idempotency] Job \${idempotencyKey} is currently active. Bypassing to avoid duplicate execution.\`);
          return res.status(409).json({ error: 'Job is actively running.' });
        }
      } else if (existingJob.status === 'FAILED') {
        const cooldownAgo = new Date(Date.now() - 30 * 1000); // 30 seconds cooldown
        if (existingJob.updatedAt < cooldownAgo) {
          console.log(\`[Idempotency] Job \${idempotencyKey} is FAILED and passed cooldown. Attempting to reclaim.\`);
          const [updated] = await db.update(jobs)
            .set({ status: 'RUNNING', attempt, startedAt: new Date(), error: null, updatedAt: new Date() })
            .where(and(eq(jobs.id, existingJob.id), eq(jobs.status, 'FAILED')))
            .returning();
          
          if (updated) {
            jobRecord = updated;
          } else {
            console.log(\`[Idempotency] Failed to acquire lock for FAILED job \${idempotencyKey}. Another worker reclaimed it.\`);
            return res.status(409).json({ error: 'Job was reclaimed by another worker.' });
          }
        } else {
          console.log(\`[Idempotency] Job \${idempotencyKey} failed too recently. Cooldown active.\`);
          return res.status(429).json({ error: 'Job failed recently. Cooldown active.' });
        }
      }`
);

fs.writeFileSync('server/routes/internal.routes.ts', code);
