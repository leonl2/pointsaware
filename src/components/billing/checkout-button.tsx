"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  priceId: string;
  label: string;
  highlight?: boolean;
}

export function CheckoutButton({ priceId, label, highlight }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`mt-6 block w-full py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
        highlight
          ? "bg-gradient-to-r from-pj-gold to-pj-gold-light text-pj-midnight hover:from-pj-gold-light hover:to-pj-amber glow-gold-sm"
          : "border border-pj-slate text-pj-cream hover:border-pj-steel hover:bg-pj-slate/30"
      }`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : label}
    </button>
  );
}
