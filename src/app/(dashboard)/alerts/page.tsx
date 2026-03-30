"use client";

import { useEffect, useState, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Bell, Plus, Mail, MessageSquare, Smartphone, Inbox, Loader2 } from "lucide-react";
import { AlertForm } from "@/components/alerts/alert-form";
import { AlertList } from "@/components/alerts/alert-list";
import { toast } from "sonner";

const channels = [
  { icon: Mail, label: "Email", desc: "Receive deal alerts in your inbox", color: "text-pj-gold", bg: "bg-pj-gold/10", enabled: true, locked: false },
  { icon: MessageSquare, label: "SMS", desc: "Text alerts for time-sensitive deals", color: "text-pj-emerald", bg: "bg-pj-emerald/10", enabled: false, locked: true },
  { icon: Smartphone, label: "Push Notifications", desc: "Browser push notifications", color: "text-pj-cyan", bg: "bg-pj-cyan/10", enabled: false, locked: false },
  { icon: Inbox, label: "In-App", desc: "See alerts in your notification center", color: "text-amber-400", bg: "bg-amber-400/10", enabled: true, locked: false },
];

interface Alert {
  id: string;
  alertType: string;
  thresholdPoints: number | null;
  channels: string[];
  isActive: boolean;
  lastTriggered: string | null;
  createdAt: string;
  origin: string;
  destination: string | null;
  cabinClasses: string[];
}

interface SavedSearch {
  id: string;
  origin: string;
  destination: string | null;
  departureStart: string;
  departureEnd: string;
  cabinClasses: string[];
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    const [alertsRes, searchesRes] = await Promise.all([
      fetch("/api/alerts").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/searches").then((r) => r.json()).catch(() => ({ data: [] })),
    ]);
    setAlerts(alertsRes.data ?? []);
    setSearches(searchesRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggle = async (id: string, isActive: boolean) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive } : a))
    );
    await fetch("/api/alerts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    });
    toast.success(isActive ? "Alert enabled" : "Alert paused");
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alert deleted");
  };

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
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-pj-gold to-pj-gold-light text-pj-midnight font-semibold text-sm hover:from-pj-gold-light hover:to-pj-amber transition-all glow-gold-sm"
        >
          <Plus className="h-4 w-4" />
          New Alert
        </button>
      </div>

      {/* Create alert form */}
      {showForm && (
        <div className="animate-fade-up">
          <AlertForm
            searches={searches}
            onCreated={() => {
              setShowForm(false);
              loadData();
            }}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

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

      {/* Alert list or empty state */}
      <div className="animate-fade-up stagger-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-pj-silver" />
          </div>
        ) : alerts.length > 0 ? (
          <div>
            <h2 className="text-sm font-semibold text-pj-cream mb-4">
              Your Alerts ({alerts.length})
            </h2>
            <AlertList
              alerts={alerts}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-pj-slate p-16 text-center">
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
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-pj-gold to-pj-gold-light text-pj-midnight font-semibold text-sm hover:from-pj-gold-light hover:to-pj-amber transition-all glow-gold-sm"
            >
              <Plus className="h-4 w-4" />
              Create Your First Alert
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
