import { NextRequest, NextResponse } from "next/server";
import { searchAwardFlights } from "@/lib/services/seats-aero";
import type { CabinClass } from "@/lib/types/flight";
import { getCached, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const month = searchParams.get("month"); // YYYY-MM
  const cabin = (searchParams.get("cabin") ?? "business") as CabinClass;

  if (!origin || !destination || !month) {
    return NextResponse.json(
      { error: "origin, destination, and month (YYYY-MM) are required" },
      { status: 400 }
    );
  }

  const startDate = `${month}-01`;
  const [year, mon] = month.split("-").map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  const endDate = `${month}-${String(lastDay).padStart(2, "0")}`;

  const cacheKey = `calendar:${origin}:${destination}:${month}:${cabin}`;

  try {
    const cached = await getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ data: cached, cached: true });
    }
  } catch {
    // Cache miss
  }

  try {
    const flights = await searchAwardFlights({
      origin,
      destination,
      startDate,
      endDate,
      cabinClasses: [cabin],
    });

    // Group by date, take lowest price per date
    const byDate: Record<string, { minPoints: number; count: number; bestAirline: string }> = {};
    for (const f of flights) {
      const date = f.departureDate.slice(0, 10);
      if (!byDate[date] || f.pointsPrice < byDate[date].minPoints) {
        byDate[date] = {
          minPoints: f.pointsPrice,
          count: (byDate[date]?.count ?? 0) + 1,
          bestAirline: f.airline,
        };
      } else {
        byDate[date].count++;
      }
    }

    try {
      await setCache(cacheKey, byDate, 600); // 10 min cache
    } catch {
      // Non-critical
    }

    return NextResponse.json({ data: byDate, cached: false });
  } catch (error) {
    console.error("Calendar data error:", error);
    return NextResponse.json(
      { error: "Failed to load calendar data" },
      { status: 500 }
    );
  }
}
