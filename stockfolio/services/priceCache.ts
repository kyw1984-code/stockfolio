interface CacheEntry {
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCachedPrice(symbol: string): CacheEntry | null {
  const entry = cache.get(symbol.toUpperCase());
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(symbol.toUpperCase());
    return null;
  }
  return entry;
}

export function setCachedPrice(
  symbol: string,
  price: number,
  change: number,
  changePercent: number
): void {
  cache.set(symbol.toUpperCase(), {
    price,
    change,
    changePercent,
    timestamp: Date.now(),
  });
}

export function clearCache(): void {
  cache.clear();
}

export function invalidateSymbol(symbol: string): void {
  cache.delete(symbol.toUpperCase());
}
