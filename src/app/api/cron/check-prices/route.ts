import { NextRequest, NextResponse } from "next/server";
import { getActiveAlerts } from "@/lib/db/queries/alerts";
import { recordPrice, buildRouteKey } from "@/lib/db/queries/price-history";
import { searchAwardFlights } from "@/lib/services/seats-aero";
import type { CabinClass } from "@/lib/types/flight";

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this automatically for cron jobs)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await getActiveAlerts();
  if (alerts.length === 0) {
    return NextResponse.json({ message: "No active alerts", checked: 0 });
  }

  // Group alerts by unique route to avoid duplicate API calls
  const routeGroups = new Map<
    string,
    { origin: string; destination: string | null; cabinClasses: string[]; departureStart: string; departureEnd: string }
  >();

  for (const alert of alerts) {
    const key = `${alert.origin}-${alert.destination ?? "any"}-${[...alert.cabinClasses].sort().join(",")}`;
    if (!routeGroups.has(key)) {
      routeGroups.set(key, {
        origin: alert.origin,
        destination: alert.destination,
        cabinClasses: alert.cabinClasses,
        departureStart: alert.departureStart,
        departureEnd: alert.departureEnd,
      });
    }
  }

  let pricesRecorded = 0;

  for (const [, route] of routeGroups) {
    try {
      const flights = await searchAwardFlights({
        origin: route.origin,
        destination: route.destination ?? undefined,
        startDate: route.departureStart,
        endDate: route.departureEnd,
        cabinClasses: route.cabinClasses as CabinClass[],
      });

      // Record price history for each unique route+cabin+program combination
      const seen = new Set<string>();
      for (const flight of flights) {
        const routeKey = buildRouteKey(
          flight.origin,
          flight.destination,
          flight.cabinClass,
          flight.program
        );
        if (seen.has(routeKey)) continue;
        seen.add(routeKey);

        await recordPrice(routeKey, flight.pointsPrice);
        pricesRecorded++;
      }
    } catch (err) {
      console.error(`Failed to check prices for ${route.origin}-${route.destination}:`, err);
    }
  }

  return NextResponse.json({
    message: "Price check complete",
    routesChecked: routeGroups.size,
    pricesRecorded,
  });
}
