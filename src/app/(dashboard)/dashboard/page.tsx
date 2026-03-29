"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plane,
  TrendingDown,
  CreditCard,
  Bell,
  Search,
  ArrowRight,
  Trash2,
  Loader2,
} from "lucide-react";
import { DealsFeed } from "@/components/dashboard/deals-feed";
import { cn } from "@/lib/utils";

interface SavedSearch {
  id: string;
  origin: string;
  destination: string | null;
  departureStart: string;
  departureEnd: string;
  cabinClasses: string[];
  createdAt: string;
}

interface PointsBalance {
  program: string;
  balance: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [balances, setBalances] = useState<PointsBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/searches").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/points").then((r) => r.json()).catch(() => ({ data: [] })),
    ]).then(([searchesRes, pointsRes]) => {
      setSearches(searchesRes.data ?? []);
      setBalances(pointsRes.data ?? []);
      setLoading(false);
    });
  }, []);

  const totalPoints = balances.reduce((sum, b) => sum + (b.balance ?? 0), 0);

  const handleDeleteSearch = async (id: string) => {
    await fetch(`/api/searches?id=${id}`, { method: "DELETE" });
    setSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const stats = [
    { label: "Active Alerts", value: "0", sub: "Set up alerts to get notified", icon: Bell, accent: "text-pj-gold" },
    {
      label: "Points Available",
      value: totalPoints > 0 ? totalPoints.toLocaleString() : "--",
      sub: totalPoints > 0 ? "Across all programs" : "Add your balances",
      icon: CreditCard,
      accent: "text-pj-cyan",
    },
    { label: "Deals Today", value: "--", sub: "Based on saved searches", icon: TrendingDown, accent: "text-pj-emerald" },
    {
      label: "Saved Searches",
      value: searches.length.toString(),
      sub: searches.length > 0 ? `${searches.length} active route${searches.length !== 1 ? "s" : ""}` : "Search to save routes",
      icon: Plane,
      accent: "text-pj-silver-bright",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-pj-cream">
          Welcome back
        </h1>
        <p className="text-pj-silver mt-1">
          Your award flight intelligence at a glance.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`animate-fade-up stagger-${i + 1} relative rounded-xl border border-pj-slate/60 bg-pj-navy p-5 mesh-card overflow-hidden group hover:border-pj-steel/60 transition-colors`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-pj-silver">
                {stat.label}
              </span>
              <stat.icon className={`h-4 w-4 ${stat.accent} opacity-60`} />
            </div>
            <p className={`text-3xl font-serif font-bold ${stat.accent}`}>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stat.value}
            </p>
            <p className="text-xs text-pj-silver/60 mt-1.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Saved Searches */}
      {searches.length > 0 && (
        <div className="animate-fade-up stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-semibold text-pj-cream">
              Saved Searches
            </h2>
            <Link
              href="/search"
              className="text-xs text-pj-gold hover:text-pj-gold-light transition-colors flex items-center gap-1"
            >
              New Search <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {searches.map((search) => {
              const searchUrl = `/search?origin=${search.origin}${search.destination ? `&destination=${search.destination}` : ""}&departureStart=${search.departureStart}&departureEnd=${search.departureEnd}&cabins=${search.cabinClasses.join(",")}`;
              return (
                <div
                  key={search.id}
                  className="group relative rounded-xl border border-pj-slate/50 bg-pj-navy p-4 hover:border-pj-steel/60 transition-colors"
                >
                  <Link href={searchUrl} className="block">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-serif font-bold text-pj-cream">
                        {search.origin}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-pj-silver/40" />
                      <span className="text-lg font-serif font-bold text-pj-cream">
                        {search.destination ?? "Anywhere"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-pj-silver">
                      <span>{formatDate(search.departureStart)} – {formatDate(search.departureEnd)}</span>
                      <span className="text-pj-slate">|</span>
                      {search.cabinClasses.map((c) => (
                        <span
                          key={c}
                          className={cn(
                            "text-[10px] uppercase font-medium",
                            c === "first" ? "text-pj-gold" : "text-pj-cyan"
                          )}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleDeleteSearch(search.id)}
                    className="absolute top-3 right-3 h-7 w-7 rounded-md text-pj-silver/30 hover:text-pj-rose hover:bg-pj-rose/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deals feed */}
      <div className="animate-fade-up stagger-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-semibold text-pj-cream">
            Recent Deals
          </h2>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pj-gold bg-pj-gold/10 border border-pj-gold/20 px-3 py-1 rounded-full">
            Business & First
          </span>
        </div>
        <DealsFeed />
      </div>
    </div>
  );
}
