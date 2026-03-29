"use client";

import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POPULAR_AIRPORTS } from "@/lib/constants/airlines";

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-pj-cream">
          Settings
        </h1>
        <p className="text-pj-silver mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Home airport */}
      <div className="animate-fade-up stagger-1 rounded-xl border border-pj-slate/60 bg-pj-navy p-6">
        <h2 className="text-sm font-semibold text-pj-cream mb-1">Home Airport</h2>
        <p className="text-xs text-pj-silver mb-4">
          Set your home airport to see personalized deals.
        </p>
        <Select>
          <SelectTrigger className="w-full max-w-xs bg-pj-navy-light border-pj-slate text-pj-cream">
            <SelectValue placeholder="Select your home airport" />
          </SelectTrigger>
          <SelectContent className="bg-pj-navy-light border-pj-slate">
            {POPULAR_AIRPORTS.filter((a) => a.country === "US").map((airport) => (
              <SelectItem key={airport.code} value={airport.code}>
                {airport.code} - {airport.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notifications */}
      <div className="animate-fade-up stagger-2 rounded-xl border border-pj-slate/60 bg-pj-navy p-6 space-y-5">
        <h2 className="text-sm font-semibold text-pj-cream">Notifications</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-pj-cream">Daily Digest Email</p>
            <p className="text-xs text-pj-silver">
              Receive a daily summary of the best deals
            </p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-pj-cream">Marketing emails</p>
            <p className="text-xs text-pj-silver">
              Tips on maximizing your points
            </p>
          </div>
          <Switch />
        </div>
      </div>

      {/* Subscription */}
      <div className="animate-fade-up stagger-3 rounded-xl border border-pj-slate/60 bg-pj-navy p-6">
        <h2 className="text-sm font-semibold text-pj-cream mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-pj-cream">Free Plan</p>
            <p className="text-sm text-pj-silver">
              10 searches/day, 3 alerts, email only
            </p>
          </div>
          <button className="px-4 py-2 rounded-lg border border-pj-gold/30 text-pj-gold text-sm font-medium hover:bg-pj-gold/10 transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
