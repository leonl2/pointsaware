import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const DEFAULT_TTL = 300; // 5 minutes

export async function getCached<T>(key: string): Promise<T | null> {
  return redis.get<T>(key);
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = DEFAULT_TTL
): Promise<void> {
  await redis.set(key, value, { ex: ttlSeconds });
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export function flightSearchCacheKey(params: {
  origin: string;
  destination?: string;
  departureStart: string;
  departureEnd: string;
  cabinClasses: string[];
}): string {
  return `flights:${params.origin}:${params.destination ?? "any"}:${params.departureStart}:${params.departureEnd}:${params.cabinClasses.sort().join(",")}`;
}
