import { db } from "@/lib/db";
import { savedSearches } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getSavedSearches(userId: string) {
  return db
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.userId, userId))
    .orderBy(desc(savedSearches.createdAt));
}

export async function createSavedSearch(
  userId: string,
  data: {
    origin: string;
    destination?: string;
    departureStart: string;
    departureEnd: string;
    cabinClasses: string[];
  }
) {
  const [search] = await db
    .insert(savedSearches)
    .values({
      userId,
      origin: data.origin,
      destination: data.destination ?? null,
      departureStart: data.departureStart,
      departureEnd: data.departureEnd,
      cabinClasses: data.cabinClasses,
    })
    .returning();
  return search;
}

export async function deleteSavedSearch(userId: string, searchId: string) {
  await db
    .delete(savedSearches)
    .where(
      and(eq(savedSearches.id, searchId), eq(savedSearches.userId, userId))
    );
}
