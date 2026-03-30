import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the module under test
vi.mock("@/lib/db/queries/alerts", () => ({
  markAlertTriggered: vi.fn(),
}));

vi.mock("@/lib/db/queries/price-history", () => ({
  detectPriceDrop: vi.fn(),
  buildRouteKey: vi.fn(
    (origin: string, dest: string, cabin: string, program: string) =>
      `${origin}-${dest}-${cabin}-${program}`
  ),
}));

vi.mock("@/lib/services/notifications", () => ({
  sendNotification: vi.fn().mockResolvedValue([]),
}));

// Import after mocks are set up
import { evaluateAlert } from "../alert-monitor";
import { markAlertTriggered } from "@/lib/db/queries/alerts";
import { sendNotification } from "@/lib/services/notifications";

function makeAlert(overrides: Record<string, unknown> = {}) {
  return {
    id: "alert-1",
    userId: "user-1",
    alertType: "price_drop",
    thresholdPoints: 60000,
    channels: ["email", "in_app"],
    lastTriggered: null,
    origin: "SFO",
    destination: "NRT",
    cabinClasses: ["business"],
    departureStart: "2026-06-01",
    departureEnd: "2026-06-30",
    ...overrides,
  };
}

function makeDeal(overrides: Record<string, unknown> = {}) {
  return {
    airline: "SQ",
    pointsPrice: 55000,
    departureDate: "2026-06-15",
    origin: "SFO",
    destination: "NRT",
    cabinClass: "business",
    program: "singapore_krisflyer",
    ...overrides,
  };
}

describe("evaluateAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("triggers price_drop alert when deal is below threshold", async () => {
    const alert = makeAlert({ thresholdPoints: 60000 });
    const deals = [makeDeal({ pointsPrice: 55000 })];

    const result = await evaluateAlert(alert, deals);

    expect(result.triggered).toBe(true);
    expect(result.matchingDeal?.pointsPrice).toBe(55000);
    expect(sendNotification).toHaveBeenCalledOnce();
    expect(markAlertTriggered).toHaveBeenCalledWith("alert-1");
  });

  it("does NOT trigger when price is above threshold", async () => {
    const alert = makeAlert({ thresholdPoints: 50000 });
    const deals = [makeDeal({ pointsPrice: 55000 })];

    const result = await evaluateAlert(alert, deals);

    expect(result.triggered).toBe(false);
    expect(sendNotification).not.toHaveBeenCalled();
    expect(markAlertTriggered).not.toHaveBeenCalled();
  });

  it("triggers availability alert for any matching deal", async () => {
    const alert = makeAlert({ alertType: "availability", thresholdPoints: null });
    const deals = [makeDeal({ pointsPrice: 100000 })];

    const result = await evaluateAlert(alert, deals);

    expect(result.triggered).toBe(true);
    expect(sendNotification).toHaveBeenCalledOnce();
  });

  it("respects 6-hour throttle", async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const alert = makeAlert({ lastTriggered: twoHoursAgo });
    const deals = [makeDeal({ pointsPrice: 10000 })];

    const result = await evaluateAlert(alert, deals);

    expect(result.triggered).toBe(false);
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it("allows trigger after throttle period expires", async () => {
    const sevenHoursAgo = new Date(Date.now() - 7 * 60 * 60 * 1000);
    const alert = makeAlert({ lastTriggered: sevenHoursAgo });
    const deals = [makeDeal({ pointsPrice: 40000 })];

    const result = await evaluateAlert(alert, deals);

    expect(result.triggered).toBe(true);
  });

  it("does NOT trigger when no deals match the route", async () => {
    const alert = makeAlert({ origin: "SFO", destination: "NRT" });
    const deals = [makeDeal({ origin: "JFK", destination: "LHR", pointsPrice: 10000 })];

    const result = await evaluateAlert(alert, deals);

    expect(result.triggered).toBe(false);
  });

  it("does NOT trigger when no deals match the cabin class", async () => {
    const alert = makeAlert({ cabinClasses: ["first"] });
    const deals = [makeDeal({ cabinClass: "business", pointsPrice: 10000 })];

    const result = await evaluateAlert(alert, deals);

    expect(result.triggered).toBe(false);
  });

  it("picks the cheapest matching deal for price_drop alerts", async () => {
    const alert = makeAlert({ thresholdPoints: 60000 });
    const deals = [
      makeDeal({ pointsPrice: 80000 }),
      makeDeal({ pointsPrice: 45000 }),
      makeDeal({ pointsPrice: 55000 }),
    ];

    const result = await evaluateAlert(alert, deals);

    expect(result.triggered).toBe(true);
    expect(result.matchingDeal?.pointsPrice).toBe(45000);
  });

  it("matches when destination is null (anywhere)", async () => {
    const alert = makeAlert({ destination: null });
    const deals = [makeDeal({ origin: "SFO", destination: "LHR", pointsPrice: 40000 })];

    const result = await evaluateAlert(alert, deals);

    expect(result.triggered).toBe(true);
  });
});
