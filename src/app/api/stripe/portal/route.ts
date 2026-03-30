import { NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/db/queries/users";
import { createCustomerPortalSession } from "@/lib/services/stripe";

export async function POST() {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.stripeCustomerId) {
    return NextResponse.json(
      { error: "No active subscription" },
      { status: 400 }
    );
  }

  try {
    const { url } = await createCustomerPortalSession(user.stripeCustomerId);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
