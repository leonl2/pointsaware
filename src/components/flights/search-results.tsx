"use client";

import { FlightCard } from "./flight-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plane, Loader2, AlertCircle, Bookmark, Check } from "lucide-react";
import { useState, useEffect } from "react";
import type { TransferOption } from "@/lib/types/flight";
import { cn } from "@/lib/utils";

interface FlightResult {
  id: string;
  origin: string;
  destination: string;
  airline: string;
  cabinClass: "economy" | "premium_economy" | "business" | "first";
  departureDate: string;
  pointsPrice: number;
  program: string;
  seatsRemaining: number;
  isDirect: boolean;
  transferOptions?: TransferOption[];
  bestOption?: TransferOption | null;
}

function getAirlineName(code: string): string {
  const names: Record<string, string> = {
    NH: "ANA", UA: "United Airlines", SQ: "Singapore Airlines",
    CX: "Cathay Pacific", BA: "British Airways", AF: "Air France",
    DL: "Delta Air Lines", AC: "Air Canada", EK: "Emirates",
    QF: "Qantas", LH: "Lufthansa", JL: "Japan Airlines",
    TK: "Turkish Airlines", QR: "Qatar Airways", EY: "Etihad",
    VS: "Virgin Atlantic", AA: "American Airlines", AS: "Alaska Airlines",
    KE: "Korean Air", OZ: "Asiana Airlines", BR: "EVA Air",
    CI: "China Airlines", MH: "Malaysia Airlines",
  };
  return names[code] ?? code;
}

export function SearchResults({
  params,
}: {
  params: { [key: string]: string | undefined };
}) {
  const [results, setResults] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("points_asc");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params.origin) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const searchParams = new URLSearchParams();
        searchParams.set("origin", params.origin!);
        if (params.destination) searchParams.set("destination", params.destination);
        if (params.departureStart) searchParams.set("departureStart", params.departureStart);
        if (params.departureEnd) searchParams.set("departureEnd", params.departureEnd);
        if (params.cabins) searchParams.set("cabins", params.cabins);

        const res = await fetch(`/api/flights/search?${searchParams}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Search failed");
        }
        const json = await res.json();
        const flights = (json.data ?? []).map((f: Record<string, unknown>) => ({
          ...f,
          departureDate: f.departureDate ?? f.departureAt,
        }));
        setResults(flights);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [params.origin, params.destination, params.departureStart, params.departureEnd, params.cabins]);

  const sorted = [...results].sort((a, b) => {
    switch (sortBy) {
      case "points_asc":
        return a.pointsPrice - b.pointsPrice;
      case "points_desc":
        return b.pointsPrice - a.pointsPrice;
      case "date_asc":
        return (a.departureDate ?? "").localeCompare(b.departureDate ?? "");
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-pj-gold" />
        <p className="text-sm text-pj-silver">Searching award availability...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-pj-rose/30 bg-pj-rose/5 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-pj-rose mx-auto mb-3" />
        <h3 className="text-lg font-serif font-semibold text-pj-cream">Search Error</h3>
        <p className="text-pj-silver mt-1 text-sm">{error}</p>
      </div>
    );
  }

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
          <button
            onClick={async () => {
              if (saved || saving) return;
              setSaving(true);
              try {
                await fetch("/api/searches", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    origin: params.origin,
                    destination: params.destination,
                    departureStart: params.departureStart,
                    departureEnd: params.departureEnd,
                    cabinClasses: params.cabins?.split(",") ?? ["business", "first"],
                  }),
                });
                setSaved(true);
              } finally {
                setSaving(false);
              }
            }}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-md border transition-all",
              saved
                ? "border-pj-emerald/30 bg-pj-emerald/10 text-pj-emerald"
                : "border-pj-slate text-pj-silver hover:text-pj-gold hover:border-pj-gold/40"
            )}
          >
            {saved ? <Check className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
            {saved ? "Saved" : "Save Search"}
          </button>
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
            <div key={deal.id} className={`animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
              <FlightCard
                deal={{
                  ...deal,
                  airlineName: getAirlineName(deal.airline),
                  transferFrom: deal.bestOption?.sourceProgramName ?? "",
                  transferRatio: deal.bestOption
                    ? `${deal.bestOption.transferRatio}:1`
                    : "",
                }}
                transferOptions={deal.transferOptions}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
