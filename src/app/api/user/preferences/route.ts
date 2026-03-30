import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser, updateUserPreferences } from "@/lib/db/queries/users";

export async function GET() {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    data: {
      homeAirport: user.homeAirport,
      notificationPrefs: user.notificationPrefs,
      phone: user.phone,
      subscriptionTier: user.subscriptionTier,
      hasStripe: !!user.stripeCustomerId,
    },
  });
}

export async function PUT(request: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { homeAirport, notificationPrefs, phone } = body;

  const updated = await updateUserPreferences(user.id, {
    ...(homeAirport !== undefined ? { homeAirport } : {}),
    ...(notificationPrefs !== undefined ? { notificationPrefs } : {}),
    ...(phone !== undefined ? { phone } : {}),
  });

  return NextResponse.json({ data: updated });
}
