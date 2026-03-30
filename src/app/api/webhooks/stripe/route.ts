import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, parseSubscriptionEvent } from "@/lib/services/stripe";
import { updateUserSubscription } from "@/lib/db/queries/users";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    const rawBody = await request.text();
    event = await constructWebhookEvent(rawBody, signature);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const result = parseSubscriptionEvent(event);
  if (result && result.userId) {
    try {
      await updateUserSubscription(result.userId, result.update);
    } catch (err) {
      console.error("Failed to update user subscription:", err);
      return NextResponse.json(
        { error: "Failed to process webhook" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
