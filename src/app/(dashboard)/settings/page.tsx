"use client";

import { useEffect, useState, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { POPULAR_AIRPORTS } from "@/lib/constants/airlines";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PushPrompt } from "@/components/notifications/push-prompt";

interface Preferences {
  homeAirport: string | null;
  notificationPrefs: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    dailyDigest: boolean;
  };
  phone: string | null;
  subscriptionTier: string;
  hasStripe: boolean;
}

const TIER_LABELS: Record<string, string> = {
  free: "Free Plan",
  pro: "Pro Plan",
  premium: "Premium Plan",
};

const TIER_DESCRIPTIONS: Record<string, string> = {
  free: "10 searches/day, 3 alerts, email only",
  pro: "Unlimited searches, 25 alerts, email + push",
  premium: "Unlimited everything, SMS, 1-year history",
};

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPrefs = useCallback(async () => {
    const res = await fetch("/api/user/preferences").then((r) => r.json()).catch(() => ({ data: null }));
    setPrefs(res.data ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { loadPrefs(); }, [loadPrefs]);

  const savePrefs = async (update: Partial<Pick<Preferences, "homeAirport" | "notificationPrefs" | "phone">>) => {
    setSaving(true);
    try {
      await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      setPrefs((prev) => prev ? { ...prev, ...update } : prev);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Failed to open billing portal");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-pj-silver" />
      </div>
    );
  }

  const notifPrefs = prefs?.notificationPrefs ?? {
    email: true, sms: false, push: false, inApp: true, dailyDigest: false,
  };

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
        <Select
          value={prefs?.homeAirport ?? undefined}
          onValueChange={(v) => v && savePrefs({ homeAirport: v })}
        >
          <SelectTrigger className="w-full max-w-xs bg-pj-midnight border-pj-slate text-pj-cream">
            <SelectValue placeholder="Select your home airport" />
          </SelectTrigger>
          <SelectContent className="bg-pj-navy border-pj-slate">
            {POPULAR_AIRPORTS.filter((a) => a.country === "US").map((airport) => (
              <SelectItem key={airport.code} value={airport.code} className="text-pj-cream">
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
          <Switch
            checked={notifPrefs.dailyDigest}
            onCheckedChange={(checked) =>
              savePrefs({ notificationPrefs: { ...notifPrefs, dailyDigest: !!checked } })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-pj-cream">Email Alerts</p>
            <p className="text-xs text-pj-silver">
              Get deal alerts in your inbox
            </p>
          </div>
          <Switch
            checked={notifPrefs.email}
            onCheckedChange={(checked) =>
              savePrefs({ notificationPrefs: { ...notifPrefs, email: !!checked } })
            }
          />
        </div>
        {(prefs?.subscriptionTier === "pro" || prefs?.subscriptionTier === "premium") && (
          <PushPrompt />
        )}
        {prefs?.subscriptionTier === "premium" && (
          <div className="pt-2 border-t border-pj-slate/30">
            <label className="text-xs text-pj-silver mb-1.5 block">Phone for SMS alerts</label>
            <input
              type="tel"
              defaultValue={prefs?.phone ?? ""}
              onBlur={(e) => savePrefs({ phone: e.target.value || null })}
              placeholder="+1 (555) 123-4567"
              className="w-full max-w-xs rounded-lg border border-pj-slate bg-pj-midnight px-3 py-2 text-sm text-pj-cream placeholder:text-pj-silver/40 focus:border-pj-gold focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Subscription */}
      <div className="animate-fade-up stagger-3 rounded-xl border border-pj-slate/60 bg-pj-navy p-6">
        <h2 className="text-sm font-semibold text-pj-cream mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-pj-cream">
              {TIER_LABELS[prefs?.subscriptionTier ?? "free"] ?? "Free Plan"}
            </p>
            <p className="text-sm text-pj-silver">
              {TIER_DESCRIPTIONS[prefs?.subscriptionTier ?? "free"] ?? ""}
            </p>
          </div>
          {prefs?.hasStripe ? (
            <button
              onClick={handleManageSubscription}
              className="px-4 py-2 rounded-lg border border-pj-slate text-pj-silver text-sm font-medium hover:border-pj-steel hover:text-pj-cream transition-colors"
            >
              Manage Subscription
            </button>
          ) : (
            <a
              href="/pricing"
              className="px-4 py-2 rounded-lg border border-pj-gold/30 text-pj-gold text-sm font-medium hover:bg-pj-gold/10 transition-colors"
            >
              Upgrade
            </a>
          )}
        </div>
      </div>

      {saving && (
        <div className="fixed bottom-4 right-4 bg-pj-navy border border-pj-slate rounded-lg px-4 py-2 text-xs text-pj-silver flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" /> Saving...
        </div>
      )}
    </div>
  );
}
