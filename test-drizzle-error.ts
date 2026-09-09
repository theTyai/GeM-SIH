import { db } from './src/db/index';
import { gemListings } from './src/db/schema';
async function test() {
  await db.insert(gemListings).values({
    id: 'gem_ext_12345',
    gemListingId: 'ext_12345',
    sellerId: '00000000-0000-0000-0000-000000000000',
    title: 'MacBook Air M2',
    listedPrice: '95000',
    specJson: {},
    scrapedAt: new Date()
  }).onConflictDoNothing();
}
test().then(() => console.log('success')).catch(e => console.error(e));
