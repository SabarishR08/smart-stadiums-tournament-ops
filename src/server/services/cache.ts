/**
 * Cache Service
 * Simple In-Memory Cache for Gemini Responses (60-second TTL)
 */

interface CacheEntry {
  response: unknown;
  timestamp: number;
}

const queryCache: { [key: string]: CacheEntry } = {};
const CACHE_TTL = 60000; // 60 seconds

export function getCached(key: string): unknown {
  const cached = queryCache[key];
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log(`Serving response from server-side cache: ${key}`);
    return cached.response;
  }
  return null;
}

export function setCache(key: string, response: unknown): void {
  queryCache[key] = { response, timestamp: Date.now() };
}

export function clearCache(): void {
  Object.keys(queryCache).forEach(key => delete queryCache[key]);
}
