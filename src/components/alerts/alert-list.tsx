"use client";

import { useState } from "react";
import { Bell, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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

interface AlertListProps {
  alerts: Alert[];
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

export function AlertList({ alerts, onToggle, onDelete }: AlertListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="group rounded-xl border border-pj-slate/50 bg-pj-navy p-4 hover:border-pj-steel/60 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base font-serif font-bold text-pj-cream">
                  {alert.origin}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-pj-silver/40" />
                <span className="text-base font-serif font-bold text-pj-cream">
                  {alert.destination ?? "Anywhere"}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded ${
                    alert.alertType === "price_drop"
                      ? "text-pj-gold bg-pj-gold/10"
                      : "text-pj-cyan bg-pj-cyan/10"
                  }`}
                >
                  {alert.alertType === "price_drop" ? "Price Drop" : "Availability"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-pj-silver">
                {alert.cabinClasses.map((c) => (
                  <span
                    key={c}
                    className={`text-[10px] uppercase font-medium ${
                      c === "first" ? "text-pj-gold" : "text-pj-cyan"
                    }`}
                  >
                    {c}
                  </span>
                ))}
                {alert.thresholdPoints && (
                  <span>Below {alert.thresholdPoints.toLocaleString()} pts</span>
                )}
                <span className="text-pj-slate">·</span>
                <span>{alert.channels.map((c) => c.replace("_", "-")).join(", ")}</span>
              </div>

              {alert.lastTriggered && (
                <p className="text-[10px] text-pj-silver/50 mt-1">
                  Last triggered{" "}
                  {new Date(alert.lastTriggered).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={alert.isActive}
                onCheckedChange={(checked) => onToggle(alert.id, !!checked)}
              />
              <button
                onClick={() => handleDelete(alert.id)}
                disabled={deletingId === alert.id}
                className="h-7 w-7 rounded-md text-pj-silver/30 hover:text-pj-rose hover:bg-pj-rose/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                {deletingId === alert.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
