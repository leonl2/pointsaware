import { NextRequest, NextResponse } from "next/server";
import { getActiveAlerts } from "@/lib/db/queries/alerts";
import { searchAwardFlights } from "@/lib/services/seats-aero";
import { evaluateAlert } from "@/lib/services/alert-monitor";
import type { CabinClass } from "@/lib/types/flight";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await getActiveAlerts();
  if (alerts.length === 0) {
    return NextResponse.json({ message: "No active alerts", triggered: 0 });
  }

  // Group alerts by route to batch API calls
  const routeGroups = new Map<string, typeof alerts>();
  for (const alert of alerts) {
    const key = `${alert.origin}-${alert.destination ?? "any"}-${[...alert.cabinClasses].sort().join(",")}`;
    if (!routeGroups.has(key)) routeGroups.set(key, []);
    routeGroups.get(key)!.push(alert);
  }

  let triggered = 0;

  for (const [, groupAlerts] of routeGroups) {
    const first = groupAlerts[0];
    try {
      const flights = await searchAwardFlights({
        origin: first.origin,
        destination: first.destination ?? undefined,
        startDate: first.departureStart,
        endDate: first.departureEnd,
        cabinClasses: first.cabinClasses as CabinClass[],
      });

      const deals = flights.map((f) => ({
        airline: f.airline,
        pointsPrice: f.pointsPrice,
        departureDate: f.departureDate,
        origin: f.origin,
        destination: f.destination,
        cabinClass: f.cabinClass,
        program: f.program,
      }));

      for (const alert of groupAlerts) {
        try {
          const result = await evaluateAlert(
            { ...alert, lastTriggered: alert.lastTriggered },
            deals
          );
          if (result.triggered) triggered++;
        } catch (err) {
          console.error(`Failed to evaluate alert ${alert.id}:`, err);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch flights for alert group:`, err);
    }
  }

  return NextResponse.json({
    message: "Alert check complete",
    alertsChecked: alerts.length,
    triggered,
  });
}
