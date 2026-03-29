import type { CabinClass } from "@/lib/types/flight";

const BASE_URL = "https://seats.aero/partnerapi";

interface SeatsAeroAvailability {
  ID: string;
  RouteKey: string;
  Route: string;
  OriginAirport: string;
  DestinationAirport: string;
  Date: string;
  ParsedDate: string;
  YAvailable: boolean;
  WAvailable: boolean;
  JAvailable: boolean;
  FAvailable: boolean;
  YMileageCost: string;
  WMileageCost: string;
  JMileageCost: string;
  FMileageCost: string;
  YRemainingSeats: number;
  WRemainingSeats: number;
  JRemainingSeats: number;
  FRemainingSeats: number;
  YAirlines: string;
  WAirlines: string;
  JAirlines: string;
  FAirlines: string;
  YDirect: boolean;
  WDirect: boolean;
  JDirect: boolean;
  FDirect: boolean;
  Source: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface SeatsAeroSearchResponse {
  data: SeatsAeroAvailability[];
  count: number;
  hasMore: boolean;
  cursor?: string;
}

export interface ParsedAwardFlight {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  cabinClass: CabinClass;
  airline: string;
  pointsPrice: number;
  seatsRemaining: number;
  isDirect: boolean;
  program: string;
  source: "seats_aero";
  fetchedAt: Date;
}

function cabinToSeatsAeroField(cabin: CabinClass): "Y" | "W" | "J" | "F" {
  switch (cabin) {
    case "economy":
      return "Y";
    case "premium_economy":
      return "W";
    case "business":
      return "J";
    case "first":
      return "F";
  }
}

function parseMileageCost(cost: string): number {
  if (!cost || cost === "" || cost === "0") return 0;
  // seats.aero returns costs as strings, sometimes comma-separated for multiple options
  const values = cost.split(",").map((v) => parseInt(v.trim(), 10));
  return Math.min(...values.filter((v) => !isNaN(v) && v > 0));
}

function parseAvailabilityToFlights(
  avail: SeatsAeroAvailability,
  cabinClasses: CabinClass[]
): ParsedAwardFlight[] {
  const flights: ParsedAwardFlight[] = [];

  for (const cabin of cabinClasses) {
    const field = cabinToSeatsAeroField(cabin);
    const isAvailable = avail[`${field}Available`];
    if (!isAvailable) continue;

    const pointsPrice = parseMileageCost(avail[`${field}MileageCost`]);
    if (pointsPrice <= 0) continue;

    const airlines = avail[`${field}Airlines`] || "";
    const airlineCode = airlines.split(",")[0]?.trim() || "??";

    flights.push({
      id: `${avail.ID}-${cabin}`,
      origin: avail.OriginAirport,
      destination: avail.DestinationAirport,
      departureDate: avail.ParsedDate || avail.Date,
      cabinClass: cabin,
      airline: airlineCode,
      pointsPrice,
      seatsRemaining: avail[`${field}RemainingSeats`] || 0,
      isDirect: avail[`${field}Direct`] || false,
      program: avail.Source,
      source: "seats_aero",
      fetchedAt: new Date(avail.UpdatedAt || avail.CreatedAt),
    });
  }

  return flights;
}

async function fetchFromSeatsAero(
  endpoint: string,
  params?: Record<string, string>
): Promise<Response> {
  const apiKey = process.env.SEATS_AERO_API_KEY;
  if (!apiKey) {
    throw new Error("SEATS_AERO_API_KEY is not configured");
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const response = await fetch(url.toString(), {
    headers: {
      "Partner-Authorization": apiKey,
      Accept: "application/json",
    },
    next: { revalidate: 300 }, // Cache for 5 minutes in Next.js
  });

  if (!response.ok) {
    throw new Error(
      `seats.aero API error: ${response.status} ${response.statusText}`
    );
  }

  return response;
}

export async function searchAwardFlights(params: {
  origin: string;
  destination?: string;
  startDate: string;
  endDate: string;
  cabinClasses: CabinClass[];
  source?: string;
}): Promise<ParsedAwardFlight[]> {
  const queryParams: Record<string, string> = {
    origin_airport: params.origin,
    start_date: params.startDate,
    end_date: params.endDate,
  };

  if (params.destination) {
    queryParams.destination_airport = params.destination;
  }

  if (params.source) {
    queryParams.source = params.source;
  }

  const response = await fetchFromSeatsAero("/search", queryParams);
  const data: SeatsAeroSearchResponse = await response.json();

  const flights: ParsedAwardFlight[] = [];
  for (const avail of data.data) {
    flights.push(
      ...parseAvailabilityToFlights(avail, params.cabinClasses)
    );
  }

  // Sort by points price ascending
  flights.sort((a, b) => a.pointsPrice - b.pointsPrice);

  return flights;
}

export async function getAvailabilityForRoute(params: {
  origin: string;
  destination: string;
  date: string;
}): Promise<SeatsAeroAvailability[]> {
  const queryParams: Record<string, string> = {
    origin_airport: params.origin,
    destination_airport: params.destination,
    start_date: params.date,
    end_date: params.date,
  };

  const response = await fetchFromSeatsAero("/search", queryParams);
  const data: SeatsAeroSearchResponse = await response.json();
  return data.data;
}
