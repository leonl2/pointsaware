import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SeatsAeroAvailability } from "../seats-aero";

function makeAvailability(
  overrides: Partial<SeatsAeroAvailability> = {}
): SeatsAeroAvailability {
  return {
    ID: overrides.ID || "test-id",
    RouteKey: "SFO-NRT",
    Route: "SFO-NRT",
    OriginAirport: "SFO",
    DestinationAirport: "NRT",
    Date: "2026-06-01",
    ParsedDate: "2026-06-01",
    YAvailable: false,
    WAvailable: false,
    JAvailable: true,
    FAvailable: false,
    YMileageCost: "0",
    WMileageCost: "0",
    JMileageCost: overrides.JMileageCost || "55000",
    FMileageCost: "0",
    YRemainingSeats: 0,
    WRemainingSeats: 0,
    JRemainingSeats: 4,
    FRemainingSeats: 0,
    YAirlines: "",
    WAirlines: "",
    JAirlines: overrides.JAirlines || "SQ",
    FAirlines: "",
    YDirect: false,
    WDirect: false,
    JDirect: true,
    FDirect: false,
    Source: "singapore",
    CreatedAt: "2026-01-01T00:00:00Z",
    UpdatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function mockFetchResponse(
  availabilities: SeatsAeroAvailability[],
  hasMore: boolean,
  cursor?: string
) {
  return Promise.resolve({
    ok: true,
    json: async () => ({
      data: availabilities,
      count: availabilities.length,
      hasMore,
      cursor,
    }),
  });
}

describe("seats.aero pagination", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubEnv("SEATS_AERO_API_KEY", "test-key");
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("returns all results from a single page", async () => {
    const avail1 = makeAvailability({ ID: "1", JMileageCost: "55000" });
    const avail2 = makeAvailability({ ID: "2", JMileageCost: "60000" });

    globalThis.fetch = vi.fn().mockReturnValueOnce(
      mockFetchResponse([avail1, avail2], false)
    );

    const { searchAwardFlights } = await import("../seats-aero");
    const flights = await searchAwardFlights({
      origin: "SFO",
      destination: "NRT",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      cabinClasses: ["business"],
    });

    expect(flights).toHaveLength(2);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("follows cursor through multiple pages", async () => {
    const page1 = makeAvailability({ ID: "p1", JMileageCost: "55000" });
    const page2 = makeAvailability({ ID: "p2", JMileageCost: "60000" });
    const page3 = makeAvailability({ ID: "p3", JMileageCost: "70000" });

    globalThis.fetch = vi
      .fn()
      .mockReturnValueOnce(mockFetchResponse([page1], true, "cursor-1"))
      .mockReturnValueOnce(mockFetchResponse([page2], true, "cursor-2"))
      .mockReturnValueOnce(mockFetchResponse([page3], false));

    const { searchAwardFlights } = await import("../seats-aero");
    const flights = await searchAwardFlights({
      origin: "SFO",
      destination: "NRT",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      cabinClasses: ["business"],
    });

    expect(flights).toHaveLength(3);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);

    // Verify cursor was passed on subsequent requests
    const secondCallUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[1][0] as string;
    expect(secondCallUrl).toContain("cursor=cursor-1");

    const thirdCallUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[2][0] as string;
    expect(thirdCallUrl).toContain("cursor=cursor-2");
  });

  it("stops at MAX_PAGES even if hasMore is true", async () => {
    const makePageResponse = (i: number) =>
      mockFetchResponse(
        [makeAvailability({ ID: `page-${i}`, JMileageCost: `${50000 + i * 1000}` })],
        true,
        `cursor-${i}`
      );

    globalThis.fetch = vi.fn();
    for (let i = 0; i < 15; i++) {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        makePageResponse(i)
      );
    }

    const { searchAwardFlights } = await import("../seats-aero");
    const flights = await searchAwardFlights({
      origin: "SFO",
      destination: "NRT",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      cabinClasses: ["business"],
    });

    // Should stop at 10 pages (MAX_PAGES), not 15
    expect(flights).toHaveLength(10);
    expect(globalThis.fetch).toHaveBeenCalledTimes(10);
  });

  it("results are sorted by points price ascending", async () => {
    const expensive = makeAvailability({ ID: "exp", JMileageCost: "90000" });
    const cheap = makeAvailability({ ID: "cheap", JMileageCost: "30000" });

    globalThis.fetch = vi
      .fn()
      .mockReturnValueOnce(mockFetchResponse([expensive], true, "c1"))
      .mockReturnValueOnce(mockFetchResponse([cheap], false));

    const { searchAwardFlights } = await import("../seats-aero");
    const flights = await searchAwardFlights({
      origin: "SFO",
      destination: "NRT",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      cabinClasses: ["business"],
    });

    expect(flights[0].pointsPrice).toBe(30000);
    expect(flights[1].pointsPrice).toBe(90000);
  });
});
