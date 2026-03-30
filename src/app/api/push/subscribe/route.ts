import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateDbUser } from "@/lib/db/queries/users";

export async function POST(request: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { subscription } = body;

  if (!subscription) {
    return NextResponse.json(
      { error: "subscription is required" },
      { status: 400 }
    );
  }

  await db
    .update(users)
    .set({ pushSubscription: subscription, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return NextResponse.json({ success: true });
}
