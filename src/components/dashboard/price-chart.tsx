"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown, TrendingUp, Minus, Loader2 } from "lucide-react";

interface PricePoint {
  id: string;
  routeKey: string;
  pointsPrice: number;
  recordedAt: string;
}

interface Insight {
  trend: "falling" | "rising" | "stable";
  recommendation: string;
  avgPrice: number | null;
  lowestPrice: number | null;
}

interface PriceChartProps {
  routeKey: string;
}

export function PriceChart({ routeKey }: PriceChartProps) {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/flights/price-history?routeKey=${encodeURIComponent(routeKey)}`)
      .then((r) => r.json())
      .then((data) => {
        setHistory(data.data?.history ?? []);
        setInsight(data.data?.insight ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [routeKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-pj-silver" />
      </div>
    );
  }

  if (history.length < 2) return null;

  const chartData = history.map((h) => ({
    date: new Date(h.recordedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    points: h.pointsPrice,
  }));

  const TrendIcon =
    insight?.trend === "falling"
      ? TrendingDown
      : insight?.trend === "rising"
        ? TrendingUp
        : Minus;

  const trendColor =
    insight?.trend === "falling"
      ? "text-green-400"
      : insight?.trend === "rising"
        ? "text-red-400"
        : "text-pj-silver";

  return (
    <div className="rounded-xl border border-pj-slate/60 bg-pj-navy p-5">
      <h3 className="text-sm font-semibold text-pj-cream mb-4">
        Price History
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4a853" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#d4a853" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "#8899aa", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#8899aa", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a2332",
              border: "1px solid #2d3748",
              borderRadius: "8px",
              color: "#e8e0d0",
              fontSize: "12px",
            }}
            formatter={(value) => [
              `${Number(value).toLocaleString()} pts`,
              "Price",
            ]}
          />
          <Area
            type="monotone"
            dataKey="points"
            stroke="#d4a853"
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {insight && (
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-pj-midnight/50 p-3">
          <TrendIcon className={`h-4 w-4 mt-0.5 shrink-0 ${trendColor}`} />
          <div>
            <p className="text-xs font-medium text-pj-cream">
              Best Time to Book
            </p>
            <p className="text-xs text-pj-silver mt-0.5">
              {insight.recommendation}
            </p>
            {insight.lowestPrice && (
              <p className="text-[10px] text-pj-silver/60 mt-1">
                Lowest: {insight.lowestPrice.toLocaleString()} pts
                {insight.avgPrice && ` · Avg: ${insight.avgPrice.toLocaleString()} pts`}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
