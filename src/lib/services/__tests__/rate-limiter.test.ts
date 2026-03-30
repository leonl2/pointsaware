import { describe, it, expect, vi, beforeEach } from "vitest";

let incrCount = 0;

vi.mock("@/lib/cache", () => ({
  redis: {
    incr: vi.fn(async () => {
      incrCount++;
      return incrCount;
    }),
    expire: vi.fn(async () => true),
  },
}));

import { checkRateLimit } from "../rate-limiter";
import { redis } from "@/lib/cache";

describe("checkRateLimit", () => {
  beforeEach(() => {
    incrCount = 0;
    vi.clearAllMocks();
  });

  it("allows requests under the limit", async () => {
    const result = await checkRateLimit("user-1", "search", 10, 86400);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
    expect(redis.incr).toHaveBeenCalledOnce();
  });

  it("sets expiry on first request", async () => {
    await checkRateLimit("user-1", "search", 10, 86400);

    expect(redis.expire).toHaveBeenCalledWith(
      expect.stringContaining("ratelimit:user-1:search:"),
      86400
    );
  });

  it("denies requests over the limit", async () => {
    incrCount = 10; // simulate already at limit
    const result = await checkRateLimit("user-1", "search", 10, 86400);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("skips check for unlimited (-1)", async () => {
    const result = await checkRateLimit("user-1", "search", -1, 86400);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(-1);
    expect(redis.incr).not.toHaveBeenCalled();
  });

  it("does not set expiry after first request", async () => {
    incrCount = 4; // simulate 5th request
    await checkRateLimit("user-1", "search", 10, 86400);

    expect(redis.expire).not.toHaveBeenCalled();
  });
});
