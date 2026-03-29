import { db } from "@/lib/db";
import { pointsBalances } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function getPointsBalances(userId: string) {
  return db
    .select()
    .from(pointsBalances)
    .where(eq(pointsBalances.userId, userId));
}

export async function upsertPointsBalance(
  userId: string,
  program: string,
  balance: number
) {
  const existing = await db
    .select()
    .from(pointsBalances)
    .where(
      and(
        eq(pointsBalances.userId, userId),
        eq(pointsBalances.program, program)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(pointsBalances)
      .set({
        balance,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pointsBalances.id, existing[0].id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(pointsBalances)
    .values({
      userId,
      program,
      balance,
      lastSyncedAt: new Date(),
      syncMethod: "manual",
    })
    .returning();
  return created;
}
