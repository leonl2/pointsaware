import Link from "next/link";
import {
  Plane,
  Search,
  Bell,
  TrendingDown,
  CreditCard,
  ArrowRight,
  Sparkles,
  Globe,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 mesh-hero" />
        {/* Decorative orbs */}
        <div className="absolute top-20 left-[15%] w-72 h-72 rounded-full bg-pj-gold/[0.03] blur-3xl" />
        <div className="absolute bottom-10 right-[10%] w-96 h-96 rounded-full bg-pj-cyan/[0.02] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-28 lg:px-8 lg:py-40">
          <div className="text-center max-w-3xl mx-auto">
            <div className="animate-fade-up inline-flex items-center gap-1.5 mb-8 text-[10px] font-semibold uppercase tracking-[0.25em] text-pj-gold bg-pj-gold/10 border border-pj-gold/20 px-4 py-2 rounded-full">
              <Sparkles className="h-3 w-3" />
              Award Flight Intelligence
            </div>
            <h1 className="animate-fade-up stagger-1 text-5xl font-serif font-bold tracking-tight sm:text-7xl text-pj-cream leading-[1.1]">
              Fly First Class
              <br />
              <span className="bg-gradient-to-r from-pj-gold via-pj-gold-light to-pj-amber bg-clip-text text-transparent">
                for Fewer Points
              </span>
            </h1>
            <p className="animate-fade-up stagger-2 mt-8 text-lg text-pj-silver max-w-2xl mx-auto leading-relaxed">
              PointsAware finds the cheapest award flights across airlines,
              optimizes your Chase UR and Amex MR transfers, and alerts you
              when premium cabin prices drop.
            </p>
            <div className="animate-fade-up stagger-3 mt-10 flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-lg text-base font-semibold bg-gradient-to-r from-pj-gold to-pj-gold-light text-pj-midnight hover:from-pj-gold-light hover:to-pj-amber transition-all glow-gold"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center h-12 px-8 rounded-lg text-base font-medium border border-pj-slate text-pj-cream hover:border-pj-steel hover:bg-pj-slate/30 transition-all"
              >
                View Pricing
              </Link>
            </div>
            <p className="animate-fade-up stagger-4 mt-5 text-xs text-pj-silver/50">
              Free plan includes 10 searches/day and 3 alerts
            </p>
          </div>

          {/* Example deal cards */}
          <div className="mt-20 grid gap-5 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                origin: "SFO",
                dest: "NRT",
                airline: "ANA",
                cabin: "Business",
                points: "55k",
                program: "Amex MR → ANA",
                cabinColor: "text-pj-cyan",
                accentBorder: "border-pj-cyan/20",
                glow: "hover:glow-cyan",
                delay: "stagger-4",
              },
              {
                origin: "JFK",
                dest: "LHR",
                airline: "British Airways",
                cabin: "Business",
                points: "60k",
                program: "Chase UR → BA",
                cabinColor: "text-pj-cyan",
                accentBorder: "border-pj-cyan/20",
                glow: "hover:glow-cyan",
                delay: "stagger-5",
              },
              {
                origin: "LAX",
                dest: "SIN",
                airline: "Singapore",
                cabin: "First",
                points: "92.5k",
                program: "Chase UR → SQ",
                cabinColor: "text-pj-gold",
                accentBorder: "border-pj-gold/20",
                glow: "hover:glow-gold",
                delay: "stagger-6",
              },
            ].map((deal, i) => (
              <div
                key={i}
                className={`animate-fade-up ${deal.delay} rounded-xl border ${deal.accentBorder} bg-pj-navy overflow-hidden ${deal.glow} transition-all group`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-pj-silver">
                      {deal.airline}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${deal.cabinColor}`}
                    >
                      {deal.cabin}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-serif font-bold text-pj-cream">
                      {deal.origin}
                    </span>
                    <ArrowRight className="h-4 w-4 text-pj-silver/40" />
                    <span className="text-2xl font-serif font-bold text-pj-cream">
                      {deal.dest}
                    </span>
                  </div>
                  <div className="rounded-lg bg-pj-slate/30 p-3">
                    <span className="text-2xl font-serif font-bold text-pj-gold">
                      {deal.points}
                    </span>
                    <span className="text-sm text-pj-silver ml-1.5">pts</span>
                    <p className="text-[10px] text-pj-silver/60 mt-1">
                      {deal.program}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pj-navy/50 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-pj-cream sm:text-4xl">
              Everything you need to maximize your points
            </h2>
            <p className="mt-4 text-lg text-pj-silver">
              Stop overpaying for award flights. PointsAware does the research for you.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Search, title: "Smart Search", desc: "Search award availability across 20+ airline programs. Find business and first class seats that others miss.", color: "text-pj-gold", bg: "bg-pj-gold/10" },
              { icon: TrendingDown, title: "Transfer Optimizer", desc: "Automatically calculates the cheapest way to book using your Chase UR or Amex MR points via transfer partners.", color: "text-pj-emerald", bg: "bg-pj-emerald/10" },
              { icon: Bell, title: "Price Alerts", desc: "Set alerts for any route. Get notified via email, SMS, or push when prices drop or seats open up.", color: "text-pj-cyan", bg: "bg-pj-cyan/10" },
              { icon: CreditCard, title: "Points Tracking", desc: "Track your balances across programs. See exactly what you can afford and the best way to spend.", color: "text-amber-400", bg: "bg-amber-400/10" },
              { icon: Globe, title: "Route Maps", desc: "Visual maps showing routes, connections, and availability calendars for easy planning.", color: "text-pj-silver-bright", bg: "bg-pj-silver-bright/10" },
              { icon: Shield, title: "Booking Intelligence", desc: "AI-powered recommendations on when to book vs. wait based on historical price trends.", color: "text-pj-rose", bg: "bg-pj-rose/10" },
            ].map((feature, i) => (
              <div
                key={i}
                className="rounded-xl border border-pj-slate/50 bg-pj-navy p-6 hover:border-pj-steel/60 transition-all mesh-card group"
              >
                <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-5`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-lg text-pj-cream">
                  {feature.title}
                </h3>
                <p className="text-pj-silver mt-2 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pj-gold/[0.06] via-transparent to-pj-cyan/[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-pj-gold/[0.04] blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8 text-center">
          <div className="relative inline-block mb-8">
            <Plane className="h-12 w-12 text-pj-gold/60 animate-float" />
            <div className="absolute -inset-4 bg-pj-gold/5 rounded-full blur-xl" />
          </div>
          <h2 className="text-4xl font-serif font-bold tracking-tight text-pj-cream">
            Ready to fly for less?
          </h2>
          <p className="mt-5 text-lg text-pj-silver max-w-xl mx-auto">
            Join savvy travelers who use PointsAware to find the best award flights
            in business and first class.
          </p>
          <Link
            href="/signup"
            className="mt-10 inline-flex items-center gap-2 h-12 px-8 rounded-lg text-base font-semibold bg-gradient-to-r from-pj-gold to-pj-gold-light text-pj-midnight hover:from-pj-gold-light hover:to-pj-amber transition-all glow-gold"
          >
            Start Searching for Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
