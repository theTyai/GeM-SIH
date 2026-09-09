import { db } from './src/db/index';
import { audits, scoreAnalysis, marketSnapshots, ruleVersions } from './src/db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

async function update() {
  const auditId = '34ee89c9-ab72-49a4-8e09-1625b4e990f1';
  await db.update(audits).set({ status: 'IN_REVIEW', riskLevel: 'HIGH', priceVariancePct: '18.5' }).where(eq(audits.id, auditId));
  
  const rules = await db.select().from(ruleVersions).orderBy(desc(ruleVersions.createdAt)).limit(1);

  const snapId = crypto.randomUUID();

  await db.insert(marketSnapshots).values({
    id: snapId,
    auditId,
    sourcePlatform: 'AMAZON',
    sourceUrl: 'https://amazon.in/demo',
    basePrice: '80168.00',
    landedCost: '80168.00',
    specJson: {},
    evidenceSha256: '91b4d142823f7d20c5f08df69122de43f35f057a988d9619f6d3138485c9a203',
    evidenceObjectKey: 'ext-demo/evidence.png',
    scrapedAt: new Date()
  }).onConflictDoNothing();

  await db.insert(scoreAnalysis).values({
    id: crypto.randomUUID(),
    auditId,
    rulesVersionId: rules[0].id,
    inputSnapshotIds: [snapId],
    fmv: '80168.00',
    priceVariancePct: '18.5',
    minSpecMatchScore: '92.5',
    riskLevel: 'HIGH',
    calculationVersion: '1.0',
    resultJson: {}
  }).onConflictDoNothing();
  
  console.log("updated");
}
update().then(() => process.exit(0));
