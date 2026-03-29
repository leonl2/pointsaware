"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Plane,
  Search,
  Bell,
  CreditCard,
  Settings,
  LayoutDashboard,
  TrendingDown,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search Flights", icon: Search },
  { href: "/deals", label: "Top Deals", icon: TrendingDown },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/points", label: "My Points", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-pj-slate/50 bg-pj-navy">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-pj-slate/50">
        <div className="relative">
          <Plane className="h-5 w-5 text-pj-gold" />
          <div className="absolute -inset-1 bg-pj-gold/10 rounded-full blur-sm" />
        </div>
        <span className="text-lg font-serif font-semibold tracking-wide text-pj-cream">
          PointsAware
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-pj-gold/10 text-pj-gold border border-pj-gold/20"
                  : "text-pj-silver hover:text-pj-cream hover:bg-pj-slate/40 border border-transparent"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive
                    ? "text-pj-gold"
                    : "text-pj-silver group-hover:text-pj-cream"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade card */}
      <div className="p-4 border-t border-pj-slate/50">
        <div className="relative rounded-xl overflow-hidden p-4">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-pj-gold/15 via-pj-gold/5 to-transparent" />
          <div className="absolute inset-0 border border-pj-gold/20 rounded-xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-pj-gold" />
              <p className="text-sm font-semibold text-pj-gold">
                Upgrade to Pro
              </p>
            </div>
            <p className="text-xs text-pj-silver leading-relaxed">
              Unlimited alerts, searches & transfer optimization
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-block rounded-md bg-pj-gold/15 border border-pj-gold/30 px-3 py-1.5 text-xs font-medium text-pj-gold hover:bg-pj-gold/25 transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
