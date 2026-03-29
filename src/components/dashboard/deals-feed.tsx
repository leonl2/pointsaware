"use client";

import { FlightCard } from "@/components/flights/flight-card";
import { Plane } from "lucide-react";

const SAMPLE_DEALS = [
  {
    id: "1",
    origin: "SFO",
    destination: "NRT",
    airline: "NH",
    airlineName: "ANA",
    cabinClass: "business" as const,
    departureDate: "2026-06-15",
    pointsPrice: 55000,
    program: "ANA Mileage Club",
    transferFrom: "Amex MR",
    transferRatio: "1:1",
    seatsRemaining: 2,
    isDirect: true,
  },
  {
    id: "2",
    origin: "JFK",
    destination: "LHR",
    airline: "BA",
    airlineName: "British Airways",
    cabinClass: "business" as const,
    departureDate: "2026-05-20",
    pointsPrice: 60000,
    program: "British Airways Avios",
    transferFrom: "Chase UR",
    transferRatio: "1:1",
    seatsRemaining: 4,
    isDirect: true,
  },
  {
    id: "3",
    origin: "LAX",
    destination: "SIN",
    airline: "SQ",
    airlineName: "Singapore Airlines",
    cabinClass: "first" as const,
    departureDate: "2026-07-01",
    pointsPrice: 92500,
    program: "Singapore KrisFlyer",
    transferFrom: "Chase UR",
    transferRatio: "1:1",
    seatsRemaining: 1,
    isDirect: false,
  },
  {
    id: "4",
    origin: "ORD",
    destination: "CDG",
    airline: "AF",
    airlineName: "Air France",
    cabinClass: "business" as const,
    departureDate: "2026-05-10",
    pointsPrice: 55000,
    program: "Flying Blue",
    transferFrom: "Amex MR",
    transferRatio: "1:1",
    seatsRemaining: 3,
    isDirect: true,
  },
];

export function DealsFeed() {
  if (SAMPLE_DEALS.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-pj-slate p-16 text-center">
        <Plane className="h-10 w-10 text-pj-silver/30 mx-auto mb-4" />
        <h3 className="text-lg font-serif font-semibold text-pj-cream">
          No deals yet
        </h3>
        <p className="text-pj-silver mt-1">
          Search for flights and save routes to see deals here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {SAMPLE_DEALS.map((deal, i) => (
        <div key={deal.id} className={`animate-fade-up stagger-${i + 1}`}>
          <FlightCard deal={deal} />
        </div>
      ))}
    </div>
  );
}
