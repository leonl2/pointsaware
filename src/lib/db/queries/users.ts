import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Get or create the DB user for the currently authenticated Clerk user.
 * Call this in any API route or server component that needs the internal user ID.
 */
export async function getOrCreateDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [newUser] = await db
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: clerkUser.firstName
        ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim()
        : null,
      image: clerkUser.imageUrl,
    })
    .returning();

  return newUser;
}

export async function getDbUserByClerkId(clerkId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return user ?? null;
}

export async function getUserById(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user ?? null;
}

export async function updateUserSubscription(
  userId: string,
  data: {
    subscriptionTier: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string | null;
  }
) {
  const [updated] = await db
    .update(users)
    .set({
      subscriptionTier: data.subscriptionTier,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return updated ?? null;
}

export async function updateUserPreferences(
  userId: string,
  data: {
    homeAirport?: string | null;
    notificationPrefs?: {
      email: boolean;
      sms: boolean;
      push: boolean;
      inApp: boolean;
      dailyDigest: boolean;
    };
    phone?: string | null;
  }
) {
  const setFields: Record<string, unknown> = { updatedAt: new Date() };
  if (data.homeAirport !== undefined) setFields.homeAirport = data.homeAirport;
  if (data.notificationPrefs !== undefined) setFields.notificationPrefs = data.notificationPrefs;
  if (data.phone !== undefined) setFields.phone = data.phone;

  const [updated] = await db
    .update(users)
    .set(setFields)
    .where(eq(users.id, userId))
    .returning();
  return updated ?? null;
}
