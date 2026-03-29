"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  PlaneTakeoff,
  PlaneLanding,
  CalendarDays,
  Search,
  ArrowRightLeft,
} from "lucide-react";
import { POPULAR_AIRPORTS } from "@/lib/constants/airlines";
import { cn } from "@/lib/utils";

const cabinOptions = [
  { value: "business", label: "Business", activeClass: "bg-pj-cyan/15 text-pj-cyan border-pj-cyan/30" },
  { value: "first", label: "First", activeClass: "bg-pj-gold/15 text-pj-gold border-pj-gold/30" },
];

export function SearchForm() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureStart, setDepartureStart] = useState("");
  const [departureEnd, setDepartureEnd] = useState("");
  const [selectedCabins, setSelectedCabins] = useState<string[]>(["business", "first"]);
  const [originSearch, setOriginSearch] = useState("");
  const [destSearch, setDestSearch] = useState("");
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const filteredOrigins = POPULAR_AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(originSearch.toLowerCase()) ||
      a.city.toLowerCase().includes(originSearch.toLowerCase()) ||
      a.name.toLowerCase().includes(originSearch.toLowerCase())
  ).slice(0, 8);

  const filteredDests = POPULAR_AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(destSearch.toLowerCase()) ||
      a.city.toLowerCase().includes(destSearch.toLowerCase()) ||
      a.name.toLowerCase().includes(destSearch.toLowerCase())
  ).slice(0, 8);

  const toggleCabin = (cabin: string) => {
    setSelectedCabins((prev) =>
      prev.includes(cabin) ? prev.filter((c) => c !== cabin) : [...prev, cabin]
    );
  };

  const swapAirports = () => {
    setOrigin(destination);
    setDestination(origin);
    setOriginSearch(destSearch);
    setDestSearch(originSearch);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !departureStart || !departureEnd) return;
    const params = new URLSearchParams({
      origin,
      ...(destination && { destination }),
      departureStart,
      departureEnd,
      cabins: selectedCabins.join(","),
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="rounded-xl border border-pj-slate/60 bg-pj-navy mesh-card overflow-hidden">
      <form onSubmit={handleSearch} className="p-6 space-y-6">
        {/* Airport inputs */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-end">
          <div className="relative">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pj-silver mb-2 flex items-center gap-1.5">
              <PlaneTakeoff className="h-3.5 w-3.5 text-pj-gold" />
              From
            </label>
            <Input
              placeholder="City or airport code"
              value={originSearch}
              onChange={(e) => {
                setOriginSearch(e.target.value);
                setShowOriginDropdown(true);
              }}
              onFocus={() => setShowOriginDropdown(true)}
              onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
              className="h-12 text-lg font-serif font-semibold bg-pj-navy-light border-pj-slate text-pj-cream placeholder:text-pj-silver/40 focus:border-pj-gold/50 focus:ring-pj-gold/20"
            />
            {origin && (
              <span className="absolute right-3 top-[38px] text-xs font-mono font-bold text-pj-gold bg-pj-gold/15 border border-pj-gold/25 px-2 py-0.5 rounded">
                {origin}
              </span>
            )}
            {showOriginDropdown && originSearch && filteredOrigins.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full bg-pj-navy-light border border-pj-slate rounded-lg shadow-2xl shadow-black/40 max-h-60 overflow-auto">
                {filteredOrigins.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    className="w-full px-3 py-2.5 text-left hover:bg-pj-slate/50 flex items-center justify-between transition-colors"
                    onMouseDown={() => {
                      setOrigin(airport.code);
                      setOriginSearch(`${airport.city} (${airport.code})`);
                      setShowOriginDropdown(false);
                    }}
                  >
                    <div>
                      <span className="font-medium text-pj-cream">{airport.city}</span>
                      <span className="text-pj-silver text-sm ml-2">{airport.name}</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-pj-gold">{airport.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="h-12 w-12 rounded-full border border-pj-slate text-pj-silver hover:text-pj-gold hover:border-pj-gold/40 hover:bg-pj-gold/5 flex items-center justify-center transition-all mb-0.5"
            onClick={swapAirports}
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>

          <div className="relative">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pj-silver mb-2 flex items-center gap-1.5">
              <PlaneLanding className="h-3.5 w-3.5 text-pj-gold" />
              To
            </label>
            <Input
              placeholder="City or airport (optional)"
              value={destSearch}
              onChange={(e) => {
                setDestSearch(e.target.value);
                setShowDestDropdown(true);
              }}
              onFocus={() => setShowDestDropdown(true)}
              onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
              className="h-12 text-lg font-serif font-semibold bg-pj-navy-light border-pj-slate text-pj-cream placeholder:text-pj-silver/40 focus:border-pj-gold/50 focus:ring-pj-gold/20"
            />
            {destination && (
              <span className="absolute right-3 top-[38px] text-xs font-mono font-bold text-pj-gold bg-pj-gold/15 border border-pj-gold/25 px-2 py-0.5 rounded">
                {destination}
              </span>
            )}
            {showDestDropdown && destSearch && filteredDests.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full bg-pj-navy-light border border-pj-slate rounded-lg shadow-2xl shadow-black/40 max-h-60 overflow-auto">
                {filteredDests.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    className="w-full px-3 py-2.5 text-left hover:bg-pj-slate/50 flex items-center justify-between transition-colors"
                    onMouseDown={() => {
                      setDestination(airport.code);
                      setDestSearch(`${airport.city} (${airport.code})`);
                      setShowDestDropdown(false);
                    }}
                  >
                    <div>
                      <span className="font-medium text-pj-cream">{airport.city}</span>
                      <span className="text-pj-silver text-sm ml-2">{airport.name}</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-pj-gold">{airport.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pj-silver mb-2 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-pj-gold" />
              Earliest departure
            </label>
            <Input
              type="date"
              value={departureStart}
              onChange={(e) => setDepartureStart(e.target.value)}
              className="h-12 bg-pj-navy-light border-pj-slate text-pj-cream focus:border-pj-gold/50 focus:ring-pj-gold/20 [color-scheme:dark]"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pj-silver mb-2 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-pj-gold" />
              Latest departure
            </label>
            <Input
              type="date"
              value={departureEnd}
              onChange={(e) => setDepartureEnd(e.target.value)}
              className="h-12 bg-pj-navy-light border-pj-slate text-pj-cream focus:border-pj-gold/50 focus:ring-pj-gold/20 [color-scheme:dark]"
              min={departureStart || new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Cabin class */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pj-silver mb-3 block">
            Cabin Class
          </label>
          <div className="flex gap-2">
            {cabinOptions.map((cabin) => (
              <button
                key={cabin.value}
                type="button"
                onClick={() => toggleCabin(cabin.value)}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-medium border transition-all",
                  selectedCabins.includes(cabin.value)
                    ? cabin.activeClass
                    : "bg-pj-navy-light text-pj-silver border-pj-slate hover:border-pj-steel hover:text-pj-cream"
                )}
              >
                {cabin.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search button */}
        <button
          type="submit"
          disabled={!origin || !departureStart || !departureEnd || selectedCabins.length === 0}
          className="w-full h-12 rounded-lg text-base font-semibold bg-gradient-to-r from-pj-gold to-pj-gold-light text-pj-midnight hover:from-pj-gold-light hover:to-pj-amber transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-gold-sm"
        >
          <Search className="h-4 w-4" />
          Search Award Flights
        </button>
      </form>
    </div>
  );
}
