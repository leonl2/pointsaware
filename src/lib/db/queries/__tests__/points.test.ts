import { describe, it, expect, vi, beforeEach } from "vitest";

// Track the chain of method calls to verify atomic upsert pattern
let methodChain: string[] = [];

const chainBuilder = () => {
  const chain: Record<string, unknown> = {};
  const methods = [
    "insert",
    "values",
    "onConflictDoUpdate",
    "returning",
    "select",
    "from",
    "where",
    "set",
    "update",
    "limit",
  ];
  for (const method of methods) {
    chain[method] = (..._args: unknown[]) => {
      methodChain.push(method);
      if (method === "returning") {
        return Promise.resolve([
          {
            id: "test-uuid",
            userId: "user-1",
            program: "chase_ur",
            balance: 50000,
            lastSyncedAt: new Date(),
            syncMethod: "manual",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
      return chain;
    };
  }
  return chain;
};

vi.mock("@/lib/db", () => ({
  db: chainBuilder(),
}));

vi.mock("@/lib/db/schema", () => ({
  pointsBalances: {
    userId: "user_id",
    program: "program",
    id: "id",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: (col: string, val: string) => ({ col, val }),
}));

describe("upsertPointsBalance", () => {
  beforeEach(() => {
    methodChain = [];
  });

  it("uses atomic insert...onConflictDoUpdate instead of select-then-insert", async () => {
    const { upsertPointsBalance } = await import("../points");

    await upsertPointsBalance("user-1", "chase_ur", 50000);

    // Must use insert → values → onConflictDoUpdate → returning (atomic pattern)
    expect(methodChain).toContain("insert");
    expect(methodChain).toContain("values");
    expect(methodChain).toContain("onConflictDoUpdate");
    expect(methodChain).toContain("returning");

    // Must NOT use select-then-insert pattern
    expect(methodChain).not.toContain("select");
    expect(methodChain).not.toContain("limit");
  });

  it("returns the upserted record", async () => {
    const { upsertPointsBalance } = await import("../points");

    const result = await upsertPointsBalance("user-1", "chase_ur", 50000);

    expect(result).toBeDefined();
    expect(result.program).toBe("chase_ur");
    expect(result.balance).toBe(50000);
  });
});
