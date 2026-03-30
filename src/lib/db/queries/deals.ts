import { db } from "@/lib/db";
import { flightDeals, savedSearches } from "@/lib/db/schema";
import { eq, and, gte, desc, inArray } from "drizzle-orm";

export async function getRecentDeals(limit = 20) {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 24);

  return db
    .select()
    .from(flightDeals)
    .where(gte(flightDeals.fetchedAt, cutoff))
    .orderBy(desc(flightDeals.fetchedAt))
    .limit(limit);
}

export async function getDealsForUser(userId: string, limit = 20) {
  // Get user's saved search routes
  const searches = await db
    .select({ origin: savedSearches.origin, destination: savedSearches.destination })
    .from(savedSearches)
    .where(and(eq(savedSearches.userId, userId), eq(savedSearches.isActive, true)));

  if (searches.length === 0) {
    return getRecentDeals(limit);
  }

  const origins = [...new Set(searches.map((s) => s.origin))];

  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 24);

  const deals = await db
    .select()
    .from(flightDeals)
    .where(
      and(
        inArray(flightDeals.origin, origins),
        gte(flightDeals.fetchedAt, cutoff)
      )
    )
    .orderBy(flightDeals.pointsPrice)
    .limit(limit);

  return deals.length > 0 ? deals : getRecentDeals(limit);
}
