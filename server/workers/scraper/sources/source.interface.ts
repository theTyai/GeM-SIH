export interface ScrapeResult {
  sourcePlatform: string;
  sourceUrl: string;
  capturedAt: string;
  htmlBuffer: Buffer;
  screenshotBuffer: Buffer;
}

export interface MarketSourceAdapter {
  platformName: string;
  canHandle(query: string): boolean;
  capture(query: string, page: any): Promise<ScrapeResult>;
}
