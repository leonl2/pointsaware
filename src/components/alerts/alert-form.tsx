"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";

interface SavedSearch {
  id: string;
  origin: string;
  destination: string | null;
  departureStart: string;
  departureEnd: string;
  cabinClasses: string[];
}

interface AlertFormProps {
  searches: SavedSearch[];
  onCreated: () => void;
  onClose: () => void;
}

export function AlertForm({ searches, onCreated, onClose }: AlertFormProps) {
  const [searchId, setSearchId] = useState(searches[0]?.id ?? "");
  const [alertType, setAlertType] = useState<"price_drop" | "availability">("price_drop");
  const [thresholdPoints, setThresholdPoints] = useState("");
  const [channels, setChannels] = useState<string[]>(["email", "in_app"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleChannel = (ch: string) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!searchId) {
      setError("Please select a saved search");
      return;
    }
    if (channels.length === 0) {
      setError("Please select at least one notification channel");
      return;
    }
    if (alertType === "price_drop" && (!thresholdPoints || parseInt(thresholdPoints) <= 0)) {
      setError("Please enter a valid points threshold");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchId,
          alertType,
          thresholdPoints: alertType === "price_drop" ? parseInt(thresholdPoints) : undefined,
          channels,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create alert");
        return;
      }

      onCreated();
    } catch {
      setError("Failed to create alert");
    } finally {
      setLoading(false);
    }
  };

  if (searches.length === 0) {
    return (
      <div className="rounded-xl border border-pj-slate/60 bg-pj-navy p-6">
        <p className="text-pj-silver text-sm">
          You need at least one saved search to create an alert.{" "}
          <a href="/search" className="text-pj-gold hover:text-pj-gold-light">
            Search for flights first
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-pj-slate/60 bg-pj-navy p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-pj-cream">New Alert</h2>
        <button
          onClick={onClose}
          className="h-7 w-7 rounded-md text-pj-silver hover:text-pj-cream hover:bg-pj-slate/50 flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Search selection */}
        <div>
          <label className="text-xs text-pj-silver mb-1.5 block">Saved Search</label>
          <select
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full rounded-lg border border-pj-slate bg-pj-midnight px-3 py-2 text-sm text-pj-cream focus:border-pj-gold focus:outline-none"
          >
            {searches.map((s) => (
              <option key={s.id} value={s.id}>
                {s.origin} → {s.destination ?? "Anywhere"} · {s.cabinClasses.join(", ")}
              </option>
            ))}
          </select>
        </div>

        {/* Alert type */}
        <div>
          <label className="text-xs text-pj-silver mb-1.5 block">Alert Type</label>
          <div className="flex gap-2">
            {[
              { value: "price_drop" as const, label: "Price Drop" },
              { value: "availability" as const, label: "New Availability" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAlertType(opt.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  alertType === opt.value
                    ? "border-pj-gold bg-pj-gold/10 text-pj-gold"
                    : "border-pj-slate text-pj-silver hover:border-pj-steel"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Threshold (price drop only) */}
        {alertType === "price_drop" && (
          <div>
            <label className="text-xs text-pj-silver mb-1.5 block">
              Alert when price drops below (points)
            </label>
            <input
              type="number"
              value={thresholdPoints}
              onChange={(e) => setThresholdPoints(e.target.value)}
              placeholder="e.g. 60000"
              className="w-full rounded-lg border border-pj-slate bg-pj-midnight px-3 py-2 text-sm text-pj-cream placeholder:text-pj-silver/40 focus:border-pj-gold focus:outline-none"
            />
          </div>
        )}

        {/* Channels */}
        <div>
          <label className="text-xs text-pj-silver mb-1.5 block">Notify via</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "email", label: "Email" },
              { id: "in_app", label: "In-App" },
              { id: "push", label: "Push" },
            ].map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => toggleChannel(ch.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  channels.includes(ch.id)
                    ? "border-pj-cyan bg-pj-cyan/10 text-pj-cyan"
                    : "border-pj-slate text-pj-silver hover:border-pj-steel"
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pj-gold to-pj-gold-light text-pj-midnight font-semibold text-sm py-2.5 hover:from-pj-gold-light hover:to-pj-amber transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create Alert
            </>
          )}
        </button>
      </form>
    </div>
  );
}
