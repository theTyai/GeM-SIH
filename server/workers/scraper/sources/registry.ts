import { MarketSourceAdapter } from './source.interface';
import { AmazonAdapter } from './amazon.adapter';
import { FlipkartAdapter } from './flipkart.adapter';

const adapters: MarketSourceAdapter[] = [
  new AmazonAdapter(),
  new FlipkartAdapter()
];

export function getAdaptersForQuery(query: string): MarketSourceAdapter[] {
  return adapters.filter(adapter => adapter.canHandle(query));
}
