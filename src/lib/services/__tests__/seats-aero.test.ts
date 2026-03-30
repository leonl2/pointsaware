import { describe, it, expect } from "vitest";
import { parseMileageCost } from "../seats-aero";

describe("parseMileageCost", () => {
  it("returns 0 for empty/null/zero input", () => {
    expect(parseMileageCost("")).toBe(0);
    expect(parseMileageCost("0")).toBe(0);
    expect(parseMileageCost(null as unknown as string)).toBe(0);
    expect(parseMileageCost(undefined as unknown as string)).toBe(0);
  });

  it("parses a single numeric value", () => {
    expect(parseMileageCost("55000")).toBe(55000);
  });

  it("returns the minimum of comma-separated values", () => {
    expect(parseMileageCost("55000, 80000, 60000")).toBe(55000);
  });

  it("returns 0 instead of Infinity when all values are invalid", () => {
    expect(parseMileageCost("abc")).toBe(0);
    expect(parseMileageCost("0,0")).toBe(0);
    expect(parseMileageCost("abc, def")).toBe(0);
  });

  it("ignores invalid values in mixed input", () => {
    expect(parseMileageCost("abc, 50000, def")).toBe(50000);
  });

  it("ignores negative values", () => {
    expect(parseMileageCost("-100, 50000")).toBe(50000);
  });
});
