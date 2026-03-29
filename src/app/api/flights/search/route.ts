import { NextRequest, NextResponse } from "next/server";
import { searchAwardFlights } from "@/lib/services/seats-aero";
import type { CabinClass } from "@/lib/types/flight";
import { getCached, setCache, flightSearchCacheKey } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination") || undefined;
  const departureStart = searchParams.get("departureStart");
  const departureEnd = searchParams.get("departureEnd");
  const cabins = searchParams.get("cabins")?.split(",") as CabinClass[] | undefined;

  if (!origin || !departureStart || !departureEnd) {
    return NextResponse.json(
      { error: "origin, departureStart, and departureEnd are required" },
      { status: 400 }
    );
  }

  const cabinClasses = cabins?.length ? cabins : ["business", "first"] as CabinClass[];

  // Check cache
  const cacheKey = flightSearchCacheKey({
    origin,
    destination,
    departureStart,
    departureEnd,
    cabinClasses,
  });

  try {
    const cached = await getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ data: cached, cached: true });
    }
  } catch {
    // Cache miss or error, continue to API call
  }

  try {
    const flights = await searchAwardFlights({
      origin,
      destination,
      startDate: departureStart,
      endDate: departureEnd,
      cabinClasses,
    });

    // Cache results for 5 minutes
    try {
      await setCache(cacheKey, flights, 300);
    } catch {
      // Cache write failure is non-critical
    }

    return NextResponse.json({ data: flights, cached: false });
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      { error: "Failed to search flights. Please try again." },
      { status: 500 }
    );
  }
}
