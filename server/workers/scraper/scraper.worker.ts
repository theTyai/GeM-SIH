import { chromium } from 'playwright';
import crypto from 'crypto';
import { db } from '../../../src/db/index';
import { audits, gemListings, marketSnapshots } from '../../../src/db/schema';
import { eq } from 'drizzle-orm';
import { storeEvidence } from './evidence-storage';
import { getAdaptersForQuery } from './sources/registry';

const SCRAPER_VERSION = "gem-intel-scraper@1.1.0";

/**
 * Executes the SCRAPE phase of the audit pipeline using real adapters.
 * Captures immutable evidence and persists the reference to market_snapshots.
 */
export async function runScrapeWorker(auditId: string) {
  console.log(`[Scrape Worker] Starting scrape for audit ${auditId}`);
  
  // 1. Fetch Context
  const [audit] = await db.select().from(audits).where(eq(audits.id, auditId));
  if (!audit) throw new Error(`Audit ${auditId} not found`);

  const [listing] = await db.select().from(gemListings).where(eq(gemListings.id, audit.gemListingId));
  const query = listing ? listing.title : 'Laptop';

  // 2. Load adapters
  const adapters = getAdaptersForQuery(query);
  if (adapters.length === 0) {
    throw new Error(`No market adapters found for query: ${query}`);
  }

  // 3. Initialize Playwright
  const browser = await chromium.launch({ headless: true }).catch(() => null);
  if (!browser) {
    console.warn("[Scrape Worker] Playwright failed to launch. Are dependencies installed? Using fallback.");
    // In strict production we throw, but for demo sandbox stability we fall back safely
    for (const adapter of adapters) {
      await fallbackSimulatedScrape(auditId, query, adapter.platformName);
    }
    return;
  }
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  try {
    for (const adapter of adapters) {
      const page = await context.newPage();
      try {
        console.log(`[Scrape Worker] Scraping ${adapter.platformName} for query: ${query}`);
        const scrapeResult = await adapter.capture(query, page);
        const snapshotId = crypto.randomUUID();

        const metadata = {
          auditId,
          snapshotId,
          sourcePlatform: scrapeResult.sourcePlatform,
          sourceUrl: scrapeResult.sourceUrl,
          capturedAt: scrapeResult.capturedAt,
          scraperVersion: SCRAPER_VERSION,
          contentType: 'text/html'
        };

        const { evidenceObjectKey, evidenceSha256 } = await storeEvidence(auditId, snapshotId, {
          htmlBuffer: scrapeResult.htmlBuffer,
          screenshotBuffer: scrapeResult.screenshotBuffer,
          metadata
        });

        await db.insert(marketSnapshots).values({
          id: snapshotId,
          auditId,
          sourcePlatform: scrapeResult.sourcePlatform,
          sourceUrl: scrapeResult.sourceUrl,
          evidenceObjectKey,
          evidenceSha256,
          isSimulated: false,
          scrapedAt: new Date(scrapeResult.capturedAt)
        });
        
        console.log(`[Scrape Worker] Completed ${adapter.platformName}. Evidence locked: ${evidenceSha256}`);
      } catch (err) {
        console.error(`[Scraper Error] Failed to scrape ${adapter.platformName}:`, err);
      } finally {
        await page.close();
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

async function fallbackSimulatedScrape(auditId: string, query: string, platformName: string) {
  const snapshotId = crypto.randomUUID();
  const capturedAt = new Date().toISOString();
  
  const url = platformName === 'AMAZON' 
    ? `https://www.amazon.in/s?k=${encodeURIComponent(query)}` 
    : `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;

  const { evidenceObjectKey, evidenceSha256 } = await storeEvidence(auditId, snapshotId, {
    htmlBuffer: Buffer.from('<html><body>Simulated due to sandbox Playwright limits</body></html>'),
    screenshotBuffer: Buffer.from(''),
    metadata: { auditId, snapshotId, sourcePlatform: platformName, sourceUrl: url, capturedAt, scraperVersion: SCRAPER_VERSION, contentType: 'text/html' }
  });

  await db.insert(marketSnapshots).values({
    id: snapshotId,
    auditId,
    sourcePlatform: platformName,
    sourceUrl: url,
    evidenceObjectKey,
    evidenceSha256,
    isSimulated: true,
    scrapedAt: new Date(capturedAt)
  });
}
