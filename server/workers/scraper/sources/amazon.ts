import { Page } from 'playwright';

export interface ScrapeResult {
  html: Buffer;
  screenshot: Buffer;
  url: string;
}

/**
 * Adapter for Amazon.in scraping.
 * Captures raw HTML and a full-page screenshot.
 * AI extraction is handled in the downstream MATCH phase.
 */
export async function scrapeAmazon(page: Page, query: string): Promise<ScrapeResult> {
  const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
  
  // Navigate to the target
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  
  // In a real adapter, you might need to handle captchas, wait for specific selectors, 
  // or scroll the page to lazy-load images.
  // Example: await page.waitForSelector('.s-search-results');
  
  // Extract Raw Bytes
  const html = Buffer.from(await page.content());
  const screenshot = await page.screenshot({ fullPage: true });

  return {
    html,
    screenshot,
    url: page.url()
  };
}
