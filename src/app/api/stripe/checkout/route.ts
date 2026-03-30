import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/db/queries/users";
import { createCheckoutSession } from "@/lib/services/stripe";

export async function POST(request: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { priceId } = body;

  if (!priceId) {
    return NextResponse.json(
      { error: "priceId is required" },
      { status: 400 }
    );
  }

  try {
    const { url } = await createCheckoutSession(user.id, user.email, priceId);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
