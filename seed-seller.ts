import { db } from './src/db/index';
import { sellers } from './src/db/schema';
async function seed() {
  await db.insert(sellers).values({
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Demo Seller',
    gemSellerId: 'SELLER_DEMO',
    riskProfile: 'LOW',
    totalListingsAudited: 0,
    highRiskFlags: 0,
    averageVariancePct: '0.0'
  }).onConflictDoNothing();
}
seed().then(() => process.exit(0)).catch(console.error);
