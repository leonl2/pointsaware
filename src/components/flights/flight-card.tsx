"use client";

import { getAirline } from "@/lib/constants/airlines";
import { Plane, Users, Clock, ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { TransferOption } from "@/lib/types/flight";

interface FlightDealSummary {
  id: string;
  origin: string;
  destination: string;
  airline: string;
  airlineName: string;
  cabinClass: "economy" | "premium_economy" | "business" | "first";
  departureDate: string;
  pointsPrice: number;
  program: string;
  transferFrom: string;
  transferRatio: string;
  seatsRemaining: number | null;
  isDirect: boolean;
}

function formatPoints(points: number): string {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(points % 1000 === 0 ? 0 : 1)}k`;
  }
  return points.toLocaleString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function FlightCard({
  deal,
  transferOptions,
}: {
  deal: FlightDealSummary;
  transferOptions?: TransferOption[];
}) {
  const [showTransfers, setShowTransfers] = useState(false);
  const airlineInfo = getAirline(deal.airline);
  const isFirst = deal.cabinClass === "first";
  const hasTransfers = transferOptions && transferOptions.length > 0;

  return (
    <div className="boarding-pass group">
      <div
        className={cn(
          "relative rounded-xl overflow-hidden transition-all duration-300",
          "border bg-pj-navy",
          isFirst
            ? "border-pj-gold/30 hover:border-pj-gold/50 glow-gold-sm hover:glow-gold"
            : "border-pj-slate/60 hover:border-pj-steel/80 glow-cyan"
        )}
      >
        {/* Dashed divider line */}
        <div className="boarding-pass-divider" />

        <div className="flex">
          {/* Main section — left 70% */}
          <div className="flex-1 p-5 pr-[32%]">
            {/* Airline + cabin badge */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold tracking-wider"
                  style={{
                    backgroundColor: airlineInfo.color + "20",
                    color: airlineInfo.color,
                    border: `1px solid ${airlineInfo.color}40`,
                  }}
                >
                  {deal.airline}
                </div>
                <span className="text-sm font-medium text-pj-cream-soft">
                  {deal.airlineName}
                </span>
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.15em] px-2 py-1 rounded-md",
                  isFirst
                    ? "bg-pj-gold/15 text-pj-gold border border-pj-gold/25"
                    : "bg-pj-cyan/10 text-pj-cyan border border-pj-cyan/20"
                )}
              >
                {deal.cabinClass.replace("_", " ")}
              </span>
            </div>

            {/* Route */}
            <div className="flex items-center gap-4 mb-4">
              <div>
                <p className="text-3xl font-serif font-bold tracking-tight text-pj-cream">
                  {deal.origin}
                </p>
              </div>
              <div className="flex-1 flex items-center gap-2 px-2">
                <div className="flex-1 h-px bg-gradient-to-r from-pj-slate to-transparent" />
                <div className="relative">
                  <Plane
                    className={cn(
                      "h-4 w-4 rotate-0",
                      isFirst ? "text-pj-gold" : "text-pj-cyan"
                    )}
                  />
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-pj-slate to-transparent" />
                {!deal.isDirect && (
                  <div className="h-1.5 w-1.5 rounded-full bg-pj-silver/40" />
                )}
              </div>
              <div>
                <p className="text-3xl font-serif font-bold tracking-tight text-pj-cream">
                  {deal.destination}
                </p>
              </div>
            </div>

            {/* Date + stops */}
            <div className="flex items-center gap-3 text-xs text-pj-silver">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>{formatDate(deal.departureDate)}</span>
              </div>
              <span className="text-pj-slate">|</span>
              <span>{deal.isDirect ? "Nonstop" : "1 stop"}</span>
              {deal.seatsRemaining !== null && deal.seatsRemaining <= 4 && (
                <>
                  <span className="text-pj-slate">|</span>
                  <div className="flex items-center gap-1 text-pj-rose">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">
                      {deal.seatsRemaining} left
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Points section — right 30% */}
          <div className="w-[30%] p-5 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-pj-silver mb-1">
              Points
            </p>
            <p
              className={cn(
                "text-3xl font-serif font-bold",
                isFirst ? "text-pj-gold" : "text-pj-cyan"
              )}
            >
              {formatPoints(deal.pointsPrice)}
            </p>
            <div className="mt-3 w-full">
              <p className="text-[10px] text-pj-silver leading-tight">
                via {deal.program}
              </p>
              {deal.transferFrom && (
                <p className="text-[10px] text-pj-gold-dim mt-0.5 font-medium">
                  {deal.transferFrom} {deal.transferRatio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Transfer options expandable section */}
        {hasTransfers && (
          <div className="border-t border-pj-slate/40">
            <button
              onClick={() => setShowTransfers(!showTransfers)}
              className="w-full px-5 py-2.5 flex items-center justify-between text-xs text-pj-silver hover:text-pj-cream transition-colors"
            >
              <span className="font-medium">
                {transferOptions.length} transfer option{transferOptions.length !== 1 ? "s" : ""}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  showTransfers && "rotate-180"
                )}
              />
            </button>
            {showTransfers && (
              <div className="px-5 pb-4 space-y-2">
                {transferOptions.map((opt, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-xs",
                      opt.canAfford
                        ? "bg-pj-emerald/5 border border-pj-emerald/20"
                        : "bg-pj-slate/20 border border-pj-slate/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {opt.canAfford ? (
                        <Check className="h-3 w-3 text-pj-emerald" />
                      ) : (
                        <X className="h-3 w-3 text-pj-silver/40" />
                      )}
                      <span className="text-pj-cream font-medium">
                        {opt.sourceProgramName}
                      </span>
                      <span className="text-pj-silver">→</span>
                      <span className="text-pj-silver">
                        {opt.targetProgramName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "font-mono font-bold",
                          opt.canAfford ? "text-pj-emerald" : "text-pj-silver"
                        )}
                      >
                        {formatPoints(opt.pointsNeeded)} pts
                      </span>
                      {opt.canAfford && (
                        <span className="text-pj-silver/50">
                          ({formatPoints(opt.remainingAfterTransfer)} left)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
