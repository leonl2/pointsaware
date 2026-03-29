import Link from "next/link";
import { Plane } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grain min-h-screen flex flex-col bg-pj-midnight">
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
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-pj-slate/30 py-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 text-center text-sm text-pj-silver/50">
          <p>&copy; {new Date().getFullYear()} PointsAware. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
