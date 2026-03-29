import { Plane, TrendingDown, CreditCard, Bell } from "lucide-react";
import { DealsFeed } from "@/components/dashboard/deals-feed";

export const metadata = { title: "Dashboard" };

const stats = [
  { label: "Active Alerts", value: "0", sub: "Set up alerts to get notified", icon: Bell, accent: "text-pj-gold" },
  { label: "Points Available", value: "--", sub: "Add your balances", icon: CreditCard, accent: "text-pj-cyan" },
  { label: "Deals Today", value: "--", sub: "Based on saved searches", icon: TrendingDown, accent: "text-pj-emerald" },
  { label: "Saved Searches", value: "0", sub: "Search to save routes", icon: Plane, accent: "text-pj-silver-bright" },
];

export default function DashboardPage() {
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
              {stat.value}
            </p>
            <p className="text-xs text-pj-silver/60 mt-1.5">{stat.sub}</p>
          </div>
        ))}
      </div>

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
