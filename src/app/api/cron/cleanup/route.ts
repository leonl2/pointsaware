import { NextRequest, NextResponse } from "next/server";
import {
  cleanupOldRecords,
  cleanupExpiredDeals,
} from "@/lib/db/queries/price-history";
import { deleteOldReadNotifications } from "@/lib/db/queries/notifications";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cleanup price history older than 90 days (pro retention)
  // Free tier (7 days) handled via API response filtering, not deletion
  await cleanupOldRecords(90);

  // Delete stale flight deals (older than 24h)
  await cleanupExpiredDeals();

  // Delete read notifications older than 30 days
  await deleteOldReadNotifications(30);

  return NextResponse.json({
    message: "Cleanup complete",
    timestamp: new Date().toISOString(),
  });
}
