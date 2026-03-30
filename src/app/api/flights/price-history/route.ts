import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/db/queries/users";
import { getRouteHistory } from "@/lib/db/queries/price-history";
import { getHistoryDays } from "@/lib/services/tier-limits";

export async function GET(request: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const routeKey = searchParams.get("routeKey");
  if (!routeKey) {
    return NextResponse.json(
      { error: "routeKey is required" },
      { status: 400 }
    );
  }

  const maxDays = getHistoryDays(user.subscriptionTier);
  const requestedDays = parseInt(searchParams.get("days") ?? String(maxDays), 10);
  const days = Math.min(requestedDays, maxDays);

  const history = await getRouteHistory(routeKey, days);

  // Compute trend insight
  const prices = history.map((h) => h.pointsPrice);
  let trend: "falling" | "rising" | "stable" = "stable";
  let recommendation = "Not enough data for a recommendation yet.";

  if (prices.length >= 4) {
    const mid = Math.floor(prices.length / 2);
    const recentAvg = prices.slice(mid).reduce((a, b) => a + b, 0) / (prices.length - mid);
    const olderAvg = prices.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
    const change = (recentAvg - olderAvg) / olderAvg;

    if (change < -0.05) {
      trend = "falling";
      recommendation = "Prices are dropping — consider waiting for a better deal.";
    } else if (change > 0.05) {
      trend = "rising";
      recommendation = "Prices are trending up — book soon before they climb higher.";
    } else {
      trend = "stable";
      recommendation = "Prices are stable — good time to book if you see a deal you like.";
    }
  }

  const avgPrice = prices.length > 0
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;

  return NextResponse.json({
    data: {
      history,
      insight: { trend, recommendation, avgPrice, lowestPrice },
    },
  });
}
