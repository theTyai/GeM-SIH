import { db } from './src/db/index';
import { ruleVersions, users } from './src/db/schema';
import crypto from 'crypto';

async function seed() {
  const adminId = crypto.randomUUID();
  const [admin] = await db.insert(users).values({
    id: adminId,
    uid: 'firebase_admin_uid_' + Date.now(),
    email: 'admin@gem.gov.in',
    fullName: 'System Admin',
    role: 'ADMIN'
  }).onConflictDoNothing().returning();
  
  const finalId = admin ? admin.id : (await db.select().from(users).limit(1))[0]?.id || adminId;

  await db.insert(ruleVersions).values({
    id: crypto.randomUUID(),
    autoFlagVariancePct: '15.00',
    minSpecMatchConfidence: '90.00',
    blockOrderThresholdPct: '50.00',
    createdBy: finalId
  }).onConflictDoNothing();
  
  console.log("Rules seeded");
}

seed().then(() => process.exit(0)).catch(console.error);
