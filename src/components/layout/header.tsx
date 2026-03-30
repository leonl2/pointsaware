"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bell, Menu, Plane } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Search,
  CreditCard,
  Settings,
  LayoutDashboard,
  TrendingDown,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/deals", label: "Deals", icon: TrendingDown },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/points", label: "Points", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = () => {
      fetch("/api/notifications/unread-count")
        .then((r) => r.json())
        .then((data) => setUnreadCount(data.count ?? 0))
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-pj-slate/50 bg-pj-navy/90 backdrop-blur-xl px-4 lg:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger className="lg:hidden inline-flex items-center justify-center rounded-md h-9 w-9 text-pj-silver hover:text-pj-cream hover:bg-pj-slate/50 transition-colors">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-pj-navy border-pj-slate/50">
          <div className="flex h-14 items-center gap-2.5 px-6 border-b border-pj-slate/50">
            <Plane className="h-5 w-5 text-pj-gold" />
            <span className="text-lg font-serif font-semibold text-pj-cream">
              PointsAware
            </span>
          </div>
          <nav className="px-3 py-4 space-y-0.5">
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
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-pj-gold/10 text-pj-gold"
                      : "text-pj-silver hover:text-pj-cream hover:bg-pj-slate/40"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <Plane className="h-4 w-4 text-pj-gold" />
        <span className="font-serif font-semibold text-pj-cream">PointsAware</span>
      </div>

      <div className="flex-1" />

      {/* Right side */}
      <Link href="/notifications">
        <div className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg text-pj-silver hover:text-pj-cream hover:bg-pj-slate/50 transition-colors cursor-pointer">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-pj-gold text-[10px] font-bold text-pj-midnight flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </Link>
      <UserButton />
    </header>
  );
}
