import { redis } from "@/lib/cache";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Sliding-window rate limiter using Redis INCR + EXPIRE.
 * limit = -1 means unlimited (always allowed).
 */
export async function checkRateLimit(
  userId: string,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (limit === -1) {
    return { allowed: true, remaining: -1, resetAt: new Date() };
  }

  const windowKey = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `ratelimit:${userId}:${action}:${windowKey}`;

  const count = await redis.incr(key);

  // Set expiry on first increment
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  const remaining = Math.max(0, limit - count);
  const resetAt = new Date((windowKey + 1) * windowSeconds * 1000);

  return {
    allowed: count <= limit,
    remaining,
    resetAt,
  };
}
