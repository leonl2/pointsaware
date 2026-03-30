import { db } from "@/lib/db";
import { pointsBalances } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
  const [result] = await db
    .insert(pointsBalances)
    .values({
      userId,
      program,
      balance,
      lastSyncedAt: new Date(),
      syncMethod: "manual",
    })
    .onConflictDoUpdate({
      target: [pointsBalances.userId, pointsBalances.program],
      set: {
        balance,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      },
    })
    .returning();
  return result;
}
