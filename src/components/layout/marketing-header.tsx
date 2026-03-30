"use client";

import Link from "next/link";
import { Plane, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MarketingHeader() {
  return (
    <header className="border-b border-pj-slate/40 bg-pj-midnight/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative">
            <Plane className="h-5 w-5 text-pj-gold" />
            <div className="absolute -inset-1 bg-pj-gold/10 rounded-full blur-sm" />
          </div>
          <span className="text-lg font-serif font-semibold tracking-wide text-pj-cream">
            PointsAware
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-sm font-medium text-pj-silver hover:text-pj-cream transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-pj-silver hover:text-pj-cream transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-pj-gold to-pj-gold-light text-pj-midnight hover:from-pj-gold-light hover:to-pj-amber transition-all"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile nav */}
        <Sheet>
          <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-md h-9 w-9 text-pj-silver hover:text-pj-cream hover:bg-pj-slate/50 transition-colors">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0 bg-pj-navy border-pj-slate/50">
            <div className="flex h-14 items-center gap-2.5 px-6 border-b border-pj-slate/50">
              <Plane className="h-5 w-5 text-pj-gold" />
              <span className="text-lg font-serif font-semibold text-pj-cream">
                PointsAware
              </span>
            </div>
            <nav className="px-4 py-6 space-y-2">
              <Link
                href="/pricing"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-pj-silver hover:text-pj-cream hover:bg-pj-slate/40 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-pj-silver hover:text-pj-cream hover:bg-pj-slate/40 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-pj-gold hover:bg-pj-gold/10 transition-colors"
              >
                Get Started
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
