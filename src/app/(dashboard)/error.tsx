"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-6">
          <AlertTriangle className="h-12 w-12 text-pj-gold" />
          <div className="absolute -inset-3 bg-pj-gold/5 rounded-full blur-xl" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-pj-cream mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-pj-silver mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-pj-gold to-pj-gold-light text-pj-midnight font-semibold text-sm hover:from-pj-gold-light hover:to-pj-amber transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-lg border border-pj-slate text-pj-silver text-sm font-medium hover:border-pj-steel hover:text-pj-cream transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
