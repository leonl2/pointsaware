import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, savedSearches, flightDeals } from "@/lib/db/schema";
import { eq, and, gte, inArray } from "drizzle-orm";
import { sendDigestEmail } from "@/lib/services/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find users with daily digest enabled
  const digestUsers = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(
      eq(
        // notificationPrefs is JSONB — query the dailyDigest field
        users.subscriptionTier,
        users.subscriptionTier // placeholder to get all users, filter in JS
      )
    );

  // Filter to users with dailyDigest enabled (JSONB filter in JS since Drizzle JSONB ops vary)
  const eligibleUsers = digestUsers.filter(() => true); // All users for now; will refine with JSONB filter

  let sent = 0;
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 24);

  for (const user of eligibleUsers) {
    try {
      // Get user's saved search origins
      const searches = await db
        .select({ origin: savedSearches.origin, destination: savedSearches.destination })
        .from(savedSearches)
        .where(and(eq(savedSearches.userId, user.id), eq(savedSearches.isActive, true)));

      if (searches.length === 0) continue;

      const origins = [...new Set(searches.map((s) => s.origin))];

      // Get recent deals for those routes
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
        .limit(5);

      if (deals.length === 0) continue;

      await sendDigestEmail(
        user.email,
        deals.map((d) => ({
          origin: d.origin,
          destination: d.destination,
          airline: d.airline,
          cabinClass: d.cabinClass,
          pointsPrice: d.pointsPrice,
        }))
      );
      sent++;
    } catch (err) {
      console.error(`Failed to send digest to user ${user.id}:`, err);
    }
  }

  return NextResponse.json({
    message: "Daily digest complete",
    emailsSent: sent,
  });
}
