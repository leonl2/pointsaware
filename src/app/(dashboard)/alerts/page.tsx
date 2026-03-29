"use client";

import { Switch } from "@/components/ui/switch";
import { Bell, Plus, Mail, MessageSquare, Smartphone, Inbox } from "lucide-react";

const channels = [
  { icon: Mail, label: "Email", desc: "Receive deal alerts in your inbox", color: "text-pj-gold", bg: "bg-pj-gold/10", enabled: true, locked: false },
  { icon: MessageSquare, label: "SMS", desc: "Text alerts for time-sensitive deals", color: "text-pj-emerald", bg: "bg-pj-emerald/10", enabled: false, locked: true },
  { icon: Smartphone, label: "Push Notifications", desc: "Browser push notifications", color: "text-pj-cyan", bg: "bg-pj-cyan/10", enabled: false, locked: false },
  { icon: Inbox, label: "In-App", desc: "See alerts in your notification center", color: "text-amber-400", bg: "bg-amber-400/10", enabled: true, locked: false },
];

export default function AlertsPage() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-pj-cream">
            Alerts
          </h1>
          <p className="text-pj-silver mt-1">
            Get notified when award seats drop in price or become available.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-pj-gold to-pj-gold-light text-pj-midnight font-semibold text-sm hover:from-pj-gold-light hover:to-pj-amber transition-all glow-gold-sm">
          <Plus className="h-4 w-4" />
          New Alert
        </button>
      </div>

      {/* Channels */}
      <div className="animate-fade-up stagger-1 rounded-xl border border-pj-slate/60 bg-pj-navy p-6">
        <h2 className="text-sm font-semibold text-pj-cream mb-5">
          Notification Channels
        </h2>
        <div className="space-y-4">
          {channels.map((ch) => (
            <div key={ch.label} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg ${ch.bg} flex items-center justify-center`}>
                  <ch.icon className={`h-4 w-4 ${ch.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-pj-cream">{ch.label}</p>
                  <p className="text-xs text-pj-silver">{ch.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ch.locked && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-pj-gold bg-pj-gold/10 border border-pj-gold/20 px-2 py-0.5 rounded">
                    Premium
                  </span>
                )}
                <Switch defaultChecked={ch.enabled} disabled={ch.locked} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      <div className="animate-fade-up stagger-2 rounded-xl border border-dashed border-pj-slate p-16 text-center">
        <div className="relative inline-block mb-4">
          <Bell className="h-10 w-10 text-pj-silver/30" />
          <div className="absolute -inset-2 bg-pj-gold/5 rounded-full blur-lg" />
        </div>
        <h3 className="text-lg font-serif font-semibold text-pj-cream">
          No alerts yet
        </h3>
        <p className="text-pj-silver mt-2 max-w-md mx-auto text-sm leading-relaxed">
          Search for flights first, then create an alert to get notified when
          prices drop or new award seats become available.
        </p>
        <button className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-pj-gold to-pj-gold-light text-pj-midnight font-semibold text-sm hover:from-pj-gold-light hover:to-pj-amber transition-all glow-gold-sm">
          <Plus className="h-4 w-4" />
          Create Your First Alert
        </button>
      </div>
    </div>
  );
}
