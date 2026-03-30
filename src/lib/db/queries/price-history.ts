import { db } from "@/lib/db";
import { priceHistory, flightDeals } from "@/lib/db/schema";
import { eq, desc, lt, and, gte } from "drizzle-orm";

export function buildRouteKey(
  origin: string,
  destination: string,
  cabinClass: string,
  program: string
): string {
  return `${origin}-${destination}-${cabinClass}-${program}`;
}

export async function recordPrice(routeKey: string, pointsPrice: number) {
  const [record] = await db
    .insert(priceHistory)
    .values({ routeKey, pointsPrice })
    .returning();
  return record;
}

export async function getRouteHistory(routeKey: string, days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return db
    .select()
    .from(priceHistory)
    .where(
      and(
        eq(priceHistory.routeKey, routeKey),
        gte(priceHistory.recordedAt, cutoff)
      )
    )
    .orderBy(priceHistory.recordedAt);
}

export async function detectPriceDrop(
  routeKey: string,
  thresholdPoints: number
): Promise<{ dropped: boolean; currentPrice: number | null }> {
  // Get the most recent price for this route
  const [latest] = await db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.routeKey, routeKey))
    .orderBy(desc(priceHistory.recordedAt))
    .limit(1);

  if (!latest) return { dropped: false, currentPrice: null };

  return {
    dropped: latest.pointsPrice <= thresholdPoints,
    currentPrice: latest.pointsPrice,
  };
}

export async function cleanupOldRecords(olderThanDays: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  await db
    .delete(priceHistory)
    .where(lt(priceHistory.recordedAt, cutoff));
}

export async function cleanupExpiredDeals() {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 24);
  await db
    .delete(flightDeals)
    .where(lt(flightDeals.fetchedAt, cutoff));
}
