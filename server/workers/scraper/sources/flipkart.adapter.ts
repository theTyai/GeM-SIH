import { MarketSourceAdapter, ScrapeResult } from './source.interface';

export class FlipkartAdapter implements MarketSourceAdapter {
  platformName = 'FLIPKART';

  canHandle(query: string): boolean {
    return true; 
  }

  async capture(query: string, page: any): Promise<ScrapeResult> {
    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    
    const htmlBuffer = Buffer.from(await page.content());
    const screenshotBuffer = await page.screenshot({ fullPage: true }).catch(() => Buffer.from(''));

    return {
      sourcePlatform: this.platformName,
      sourceUrl: url,
      capturedAt: new Date().toISOString(),
      htmlBuffer,
      screenshotBuffer
    };
  }
}
