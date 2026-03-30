import { describe, it, expect } from "vitest";
import {
  getTierLimits,
  canUseChannel,
  getHistoryDays,
  isUnlimited,
  TIER_LIMITS,
} from "../tier-limits";

describe("getTierLimits", () => {
  it("returns free tier limits", () => {
    const limits = getTierLimits("free");
    expect(limits.searchesPerDay).toBe(10);
    expect(limits.maxAlerts).toBe(3);
    expect(limits.maxPrograms).toBe(1);
    expect(limits.historyDays).toBe(7);
  });

  it("returns pro tier limits", () => {
    const limits = getTierLimits("pro");
    expect(limits.searchesPerDay).toBe(-1);
    expect(limits.maxAlerts).toBe(25);
    expect(limits.maxPrograms).toBe(2);
    expect(limits.historyDays).toBe(90);
  });

  it("returns premium tier limits", () => {
    const limits = getTierLimits("premium");
    expect(limits.searchesPerDay).toBe(-1);
    expect(limits.maxAlerts).toBe(-1);
    expect(limits.maxPrograms).toBe(-1);
    expect(limits.historyDays).toBe(365);
  });

  it("falls back to free for unknown tier", () => {
    const limits = getTierLimits("nonexistent");
    expect(limits).toEqual(TIER_LIMITS.free);
  });
});

describe("canUseChannel", () => {
  it("free tier can use email and in_app", () => {
    expect(canUseChannel("free", "email")).toBe(true);
    expect(canUseChannel("free", "in_app")).toBe(true);
  });

  it("free tier cannot use push or sms", () => {
    expect(canUseChannel("free", "push")).toBe(false);
    expect(canUseChannel("free", "sms")).toBe(false);
  });

  it("pro tier can use push but not sms", () => {
    expect(canUseChannel("pro", "push")).toBe(true);
    expect(canUseChannel("pro", "sms")).toBe(false);
  });

  it("premium tier can use all channels", () => {
    expect(canUseChannel("premium", "email")).toBe(true);
    expect(canUseChannel("premium", "push")).toBe(true);
    expect(canUseChannel("premium", "sms")).toBe(true);
    expect(canUseChannel("premium", "in_app")).toBe(true);
  });
});

describe("getHistoryDays", () => {
  it("returns correct days per tier", () => {
    expect(getHistoryDays("free")).toBe(7);
    expect(getHistoryDays("pro")).toBe(90);
    expect(getHistoryDays("premium")).toBe(365);
  });
});

describe("isUnlimited", () => {
  it("returns true for -1", () => {
    expect(isUnlimited(-1)).toBe(true);
  });

  it("returns false for positive values", () => {
    expect(isUnlimited(10)).toBe(false);
    expect(isUnlimited(0)).toBe(false);
  });
});
