"use client";

import { FlightCard } from "./flight-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plane } from "lucide-react";
import { useState } from "react";

const SAMPLE_RESULTS = [
  {
    id: "r1",
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
    id: "r2",
    origin: "SFO",
    destination: "NRT",
    airline: "UA",
    airlineName: "United Airlines",
    cabinClass: "business" as const,
    departureDate: "2026-06-15",
    pointsPrice: 70000,
    program: "United MileagePlus",
    transferFrom: "Chase UR",
    transferRatio: "1:1",
    seatsRemaining: 4,
    isDirect: true,
  },
  {
    id: "r3",
    origin: "SFO",
    destination: "NRT",
    airline: "SQ",
    airlineName: "Singapore Airlines",
    cabinClass: "business" as const,
    departureDate: "2026-06-16",
    pointsPrice: 62000,
    program: "Singapore KrisFlyer",
    transferFrom: "Chase UR",
    transferRatio: "1:1",
    seatsRemaining: 1,
    isDirect: false,
  },
  {
    id: "r4",
    origin: "SFO",
    destination: "NRT",
    airline: "CX",
    airlineName: "Cathay Pacific",
    cabinClass: "first" as const,
    departureDate: "2026-06-17",
    pointsPrice: 110000,
    program: "Cathay Asia Miles",
    transferFrom: "Amex MR",
    transferRatio: "1:1",
    seatsRemaining: 1,
    isDirect: false,
  },
];

export function SearchResults({
  params,
}: {
  params: { [key: string]: string | undefined };
}) {
  const [sortBy, setSortBy] = useState("points_asc");

  const sorted = [...SAMPLE_RESULTS].sort((a, b) => {
    switch (sortBy) {
      case "points_asc":
        return a.pointsPrice - b.pointsPrice;
      case "points_desc":
        return b.pointsPrice - a.pointsPrice;
      case "date_asc":
        return a.departureDate.localeCompare(b.departureDate);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-serif font-semibold text-pj-cream">
            {params.origin}
            {params.destination ? ` → ${params.destination}` : " → Anywhere"}
          </h2>
          <span className="text-xs font-mono text-pj-silver bg-pj-slate/50 px-2 py-0.5 rounded">
            {sorted.length} results
          </span>
        </div>
        <Select value={sortBy} onValueChange={(val) => val && setSortBy(val)}>
          <SelectTrigger className="w-44 bg-pj-navy-light border-pj-slate text-pj-cream text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-pj-navy-light border-pj-slate">
            <SelectItem value="points_asc">Points: Low to High</SelectItem>
            <SelectItem value="points_desc">Points: High to Low</SelectItem>
            <SelectItem value="date_asc">Date: Earliest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-pj-slate p-16 text-center">
          <Plane className="h-10 w-10 text-pj-silver/30 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-semibold text-pj-cream">
            No flights found
          </h3>
          <p className="text-pj-silver mt-1">
            Try adjusting your dates or destination.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sorted.map((deal, i) => (
            <div key={deal.id} className={`animate-fade-up stagger-${i + 1}`}>
              <FlightCard deal={deal} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
