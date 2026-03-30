import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";

export const metadata = { title: "Pricing" };

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with award flight search",
    features: [
      "10 searches per day",
      "3 active alerts",
      "Email notifications only",
      "7-day price history",
      "1 points program",
    ],
    cta: "Get Started",
    href: "/signup",
    priceId: null,
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For frequent travelers who want more",
    features: [
      "Unlimited searches",
      "25 active alerts",
      "Email + push notifications",
      "90-day price history",
      "2 points programs",
      "Transfer optimizer",
      "Availability calendar",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    highlight: true,
  },
  {
    name: "Premium",
    price: "$19",
    period: "/month",
    description: "Maximum value from your points",
    features: [
      "Everything in Pro",
      "Unlimited alerts",
      "SMS notifications",
      "1-year price history",
      "Unlimited programs",
      "Booking intelligence",
      "Daily digest emails",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID ?? null,
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-1.5 mb-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-pj-gold bg-pj-gold/10 border border-pj-gold/20 px-4 py-2 rounded-full">
            Pricing
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-pj-cream sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-5 text-lg text-pj-silver max-w-xl mx-auto">
            Choose the plan that fits your travel style. Cancel anytime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border overflow-hidden ${
                plan.highlight
                  ? "border-pj-gold/40 glow-gold"
                  : "border-pj-slate/50"
              } bg-pj-navy`}
            >
              {plan.highlight && (
                <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-pj-gold to-transparent" />
              )}
              {plan.highlight && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-pj-midnight bg-pj-gold px-3 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}
              <div className={`text-center p-8 ${plan.highlight ? "pt-12" : ""}`}>
                <h3 className="text-base font-semibold text-pj-cream">
                  {plan.name}
                </h3>
                <div className="mt-4">
                  <span className="text-5xl font-serif font-bold text-pj-cream">
                    {plan.price}
                  </span>
                  <span className="text-pj-silver">{plan.period}</span>
                </div>
                <p className="text-sm text-pj-silver mt-3">{plan.description}</p>

                {plan.priceId ? (
                  <CheckoutButton
                    priceId={plan.priceId}
                    label={plan.cta}
                    highlight={plan.highlight}
                  />
                ) : (
                  <Link
                    href={plan.href}
                    className="mt-6 block w-full py-3 rounded-lg text-sm font-semibold transition-all border border-pj-slate text-pj-cream hover:border-pj-steel hover:bg-pj-slate/30 text-center"
                  >
                    {plan.cta}
                  </Link>
                )}

                <ul className="mt-8 space-y-3 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-pj-gold mt-0.5 shrink-0" />
                      <span className="text-pj-cream-soft">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
