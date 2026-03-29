"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CabinClass } from "@/lib/types/flight";

interface CalendarDay {
  minPoints: number;
  count: number;
  bestAirline: string;
}

interface AvailabilityCalendarProps {
  origin: string;
  destination: string;
  cabin?: CabinClass;
  onSelectDate?: (date: string) => void;
}

function formatPoints(points: number): string {
  if (points >= 1000) return `${Math.round(points / 1000)}k`;
  return points.toString();
}

function getPriceLevel(points: number, allPoints: number[]): "low" | "mid" | "high" {
  if (allPoints.length === 0) return "mid";
  const sorted = [...allPoints].sort((a, b) => a - b);
  const p33 = sorted[Math.floor(sorted.length * 0.33)];
  const p66 = sorted[Math.floor(sorted.length * 0.66)];
  if (points <= p33) return "low";
  if (points <= p66) return "mid";
  return "high";
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AvailabilityCalendar({
  origin,
  destination,
  cabin = "business",
  onSelectDate,
}: AvailabilityCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );
  const [data, setData] = useState<Record<string, CalendarDay>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!origin || !destination) return;

    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          origin,
          destination,
          month: currentMonth,
          cabin,
        });
        const res = await fetch(`/api/flights/calendar?${params}`);
        const json = await res.json();
        setData(json.data ?? {});
      } catch {
        setData({});
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [origin, destination, currentMonth, cabin]);

  const [year, month] = currentMonth.split("-").map(Number);
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const allPoints = Object.values(data).map((d) => d.minPoints);

  const navigateMonth = (direction: -1 | 1) => {
    const d = new Date(year, month - 1 + direction, 1);
    setCurrentMonth(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const canGoPrev = !(year === today.getFullYear() && month - 1 === today.getMonth());

  return (
    <div className="rounded-xl border border-pj-slate/60 bg-pj-navy p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-serif font-semibold text-pj-cream">
          {origin} → {destination}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            disabled={!canGoPrev}
            className="h-8 w-8 rounded-md border border-pj-slate text-pj-silver hover:text-pj-cream hover:border-pj-steel flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-pj-cream min-w-[140px] text-center">
            {monthName}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="h-8 w-8 rounded-md border border-pj-slate text-pj-silver hover:text-pj-cream hover:border-pj-steel flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-[10px] text-pj-silver">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-pj-emerald/30 border border-pj-emerald/40" />
          Low
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-pj-gold/25 border border-pj-gold/35" />
          Medium
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-pj-rose/20 border border-pj-rose/30" />
          High
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-pj-slate/30 border border-pj-slate/40" />
          No availability
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-pj-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday headers */}
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-semibold uppercase tracking-wider text-pj-silver/50 pb-2"
            >
              {d}
            </div>
          ))}

          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentMonth}-${String(day).padStart(2, "0")}`;
            const dayData = data[dateStr];
            const isPast = new Date(dateStr) < new Date(today.toDateString());

            const level = dayData ? getPriceLevel(dayData.minPoints, allPoints) : null;

            return (
              <button
                key={day}
                disabled={isPast || !dayData}
                onClick={() => onSelectDate?.(dateStr)}
                className={cn(
                  "relative rounded-lg p-1.5 min-h-[56px] text-left transition-all border",
                  isPast && "opacity-30",
                  dayData
                    ? level === "low"
                      ? "bg-pj-emerald/10 border-pj-emerald/20 hover:border-pj-emerald/40"
                      : level === "mid"
                        ? "bg-pj-gold/8 border-pj-gold/15 hover:border-pj-gold/35"
                        : "bg-pj-rose/8 border-pj-rose/15 hover:border-pj-rose/30"
                    : "bg-pj-slate/10 border-pj-slate/20"
                )}
              >
                <span className="text-xs text-pj-silver">{day}</span>
                {dayData && (
                  <div className="mt-0.5">
                    <span
                      className={cn(
                        "text-xs font-mono font-bold block",
                        level === "low"
                          ? "text-pj-emerald"
                          : level === "mid"
                            ? "text-pj-gold"
                            : "text-pj-rose"
                      )}
                    >
                      {formatPoints(dayData.minPoints)}
                    </span>
                    {dayData.count > 1 && (
                      <span className="text-[9px] text-pj-silver/50">
                        +{dayData.count - 1} more
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
