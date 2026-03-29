"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { CreditCard, Pencil, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PointsProgram {
  program: string;
  name: string;
  balance: number;
  lastSyncedAt: string | null;
  cardGradient: string;
  chipColor: string;
  logo: string;
  accentColor: string;
}

const PROGRAM_CONFIGS: Record<string, Omit<PointsProgram, "balance" | "lastSyncedAt">> = {
  chase_ur: {
    program: "chase_ur",
    name: "Chase Ultimate Rewards",
    cardGradient: "from-[#0a1628] via-[#122040] to-[#1a3060]",
    chipColor: "bg-pj-gold/80",
    logo: "CHASE",
    accentColor: "text-pj-silver-bright",
  },
  amex_mr: {
    program: "amex_mr",
    name: "Amex Membership Rewards",
    cardGradient: "from-[#0d1a2e] via-[#142844] to-[#1a3560]",
    chipColor: "bg-pj-gold/80",
    logo: "AMEX",
    accentColor: "text-pj-cyan",
  },
};

const CHASE_PARTNERS = [
  "United MileagePlus", "British Airways Avios", "Air France/KLM Flying Blue",
  "Singapore KrisFlyer", "Virgin Atlantic Flying Club", "Emirates Skywards",
  "Air Canada Aeroplan", "Southwest Rapid Rewards", "Iberia Plus Avios", "Aer Lingus AerClub",
];

const AMEX_PARTNERS = [
  "Delta SkyMiles", "ANA Mileage Club", "British Airways Avios",
  "Air France/KLM Flying Blue", "Singapore KrisFlyer", "Cathay Pacific Asia Miles",
  "Emirates Skywards", "Air Canada Aeroplan", "Virgin Atlantic Flying Club",
  "Avianca LifeMiles", "JetBlue TrueBlue", "Etihad Guest", "Hawaiian Miles", "Iberia Plus Avios",
];

function formatPoints(points: number): string {
  return points.toLocaleString();
}

function PointsCard({
  program,
  saving,
  onUpdateBalance,
}: {
  program: PointsProgram;
  saving: boolean;
  onUpdateBalance: (program: string, balance: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(program.balance.toString());

  const handleSave = () => {
    const val = parseInt(editValue.replace(/,/g, ""), 10);
    if (!isNaN(val) && val >= 0) {
      onUpdateBalance(program.program, val);
    }
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 overflow-hidden bg-gradient-to-br border border-pj-slate/40",
        program.cardGradient
      )}
      style={{ minHeight: 220 }}
    >
      <div className={cn("absolute top-6 right-6 w-10 h-7 rounded-md", program.chipColor)} />
      <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-white/[0.02]" />
      <div className="absolute -bottom-5 -right-5 w-24 h-24 rounded-full bg-white/[0.02]" />
      <div className="absolute inset-0 rounded-2xl border border-white/[0.05]" />

      <div className="relative z-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-pj-silver/60">
          {program.logo}
        </p>
        <p className={cn("text-base font-semibold mt-1", program.accentColor)}>
          {program.name}
        </p>

        <div className="mt-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-pj-silver/50">
            Points Balance
          </p>
          {editing ? (
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-10 text-xl font-serif font-bold bg-white/5 border-white/10 text-pj-cream placeholder:text-white/30 w-40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setEditing(false);
                }}
              />
              <button
                className="h-8 w-8 rounded-md text-pj-emerald hover:bg-white/10 flex items-center justify-center transition-colors"
                onClick={handleSave}
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                className="h-8 w-8 rounded-md text-pj-rose hover:bg-white/10 flex items-center justify-center transition-colors"
                onClick={() => setEditing(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-serif font-bold text-pj-cream">
                {program.balance === 0 ? "--" : formatPoints(program.balance)}
              </span>
              <button
                className="h-7 w-7 rounded-md text-pj-silver/40 hover:text-pj-gold hover:bg-white/10 flex items-center justify-center transition-colors"
                onClick={() => {
                  setEditValue(program.balance.toString());
                  setEditing(true);
                }}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Pencil className="h-3 w-3" />
                )}
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-[10px] text-pj-silver/40">
          {program.lastSyncedAt
            ? `Last updated: ${new Date(program.lastSyncedAt).toLocaleDateString()}`
            : "Click pencil to enter balance"}
        </p>
      </div>
    </div>
  );
}

export default function PointsPage() {
  const [programs, setPrograms] = useState<PointsProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProgram, setSavingProgram] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    try {
      const res = await fetch("/api/points");
      const json = await res.json();
      const balances = json.data ?? [];

      // Merge DB balances with config for both programs
      const merged = ["chase_ur", "amex_mr"].map((prog) => {
        const config = PROGRAM_CONFIGS[prog];
        const dbRow = balances.find((b: { program: string }) => b.program === prog);
        return {
          ...config,
          balance: dbRow?.balance ?? 0,
          lastSyncedAt: dbRow?.lastSyncedAt ?? null,
        } as PointsProgram;
      });

      setPrograms(merged);
    } catch {
      // Fallback to empty balances
      setPrograms(
        ["chase_ur", "amex_mr"].map((prog) => ({
          ...PROGRAM_CONFIGS[prog],
          balance: 0,
          lastSyncedAt: null,
        })) as PointsProgram[]
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const handleUpdateBalance = async (program: string, balance: number) => {
    setSavingProgram(program);
    try {
      await fetch("/api/points", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program, balance }),
      });
      // Optimistic update
      setPrograms((prev) =>
        prev.map((p) =>
          p.program === program
            ? { ...p, balance, lastSyncedAt: new Date().toISOString() }
            : p
        )
      );
    } finally {
      setSavingProgram(null);
    }
  };

  const totalPoints = programs.reduce((sum, p) => sum + p.balance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-pj-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-pj-cream">
          My Points
        </h1>
        <p className="text-pj-silver mt-1">
          Track your reward points balances across programs.
        </p>
      </div>

      {/* Summary */}
      <div className="animate-fade-up stagger-1 rounded-xl border border-pj-slate/60 bg-pj-navy p-6 mesh-card">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="h-4 w-4 text-pj-gold opacity-60" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-pj-silver">
            Total Points Across All Programs
          </span>
        </div>
        <p className="text-4xl font-serif font-bold text-pj-gold">
          {totalPoints === 0 ? "--" : formatPoints(totalPoints)}
        </p>
        <p className="text-xs text-pj-silver/50 mt-2">
          Click the pencil icon on any card to update your balance
        </p>
      </div>

      {/* Points cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {programs.map((program, i) => (
          <div key={program.program} className={`animate-fade-up stagger-${i + 2}`}>
            <PointsCard
              program={program}
              saving={savingProgram === program.program}
              onUpdateBalance={handleUpdateBalance}
            />
          </div>
        ))}
      </div>

      {/* Transfer partners */}
      <div className="animate-fade-up stagger-4 rounded-xl border border-pj-slate/60 bg-pj-navy p-6">
        <h2 className="text-xl font-serif font-semibold text-pj-cream mb-6">
          Transfer Partners
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-pj-silver-bright">
              <div className="w-2.5 h-2.5 rounded-full bg-pj-silver-bright" />
              Chase Ultimate Rewards
            </h3>
            <div className="space-y-2">
              {CHASE_PARTNERS.map((partner) => (
                <div key={partner} className="flex items-center justify-between text-sm py-1 border-b border-pj-slate/30 last:border-0">
                  <span className="text-pj-cream-soft">{partner}</span>
                  <span className="text-[10px] font-mono text-pj-gold bg-pj-gold/10 px-2 py-0.5 rounded">
                    1:1
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-pj-cyan">
              <div className="w-2.5 h-2.5 rounded-full bg-pj-cyan" />
              Amex Membership Rewards
            </h3>
            <div className="space-y-2">
              {AMEX_PARTNERS.map((partner) => (
                <div key={partner} className="flex items-center justify-between text-sm py-1 border-b border-pj-slate/30 last:border-0">
                  <span className="text-pj-cream-soft">{partner}</span>
                  <span className="text-[10px] font-mono text-pj-gold bg-pj-gold/10 px-2 py-0.5 rounded">
                    1:1
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
