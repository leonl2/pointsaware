"use client";

import { useEffect, useState } from "react";
import { FlightCard } from "@/components/flights/flight-card";
import { Plane, Loader2 } from "lucide-react";
import { getAirline } from "@/lib/constants/airlines";

interface Deal {
  id: string;
  origin: string;
  destination: string;
  airline: string;
  cabinClass: string;
  pointsPrice: number;
  program: string;
  seatsRemaining: number | null;
  isDirect: boolean;
  departureAt: string;
  fetchedAt: string;
}

export function DealsFeed() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deals")
      .then((r) => r.json())
      .then((data) => setDeals(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-pj-silver" />
      </div>
    );
  }

  if (deals.length === 0) {
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
      {deals.map((deal, i) => (
        <div key={deal.id} className={`animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
          <FlightCard
            deal={{
              id: deal.id,
              origin: deal.origin,
              destination: deal.destination,
              airline: deal.airline,
              airlineName: getAirline(deal.airline).name,
              cabinClass: deal.cabinClass as "business" | "first" | "economy" | "premium_economy",
              departureDate: deal.departureAt,
              pointsPrice: deal.pointsPrice,
              program: deal.program,
              transferFrom: "",
              transferRatio: "",
              seatsRemaining: deal.seatsRemaining ?? 0,
              isDirect: deal.isDirect,
            }}
          />
        </div>
      ))}
    </div>
  );
}
