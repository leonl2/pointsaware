import Stripe from "stripe";
import type { SubscriptionTier } from "./tier-limits";

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
    });
  }
  return _stripe;
}

const PRICE_TO_TIER: Record<string, SubscriptionTier> = {};

function initPriceTierMap() {
  if (process.env.STRIPE_PRO_PRICE_ID) {
    PRICE_TO_TIER[process.env.STRIPE_PRO_PRICE_ID] = "pro";
  }
  if (process.env.STRIPE_PREMIUM_PRICE_ID) {
    PRICE_TO_TIER[process.env.STRIPE_PREMIUM_PRICE_ID] = "premium";
  }
}

function tierFromPriceId(priceId: string): SubscriptionTier {
  if (Object.keys(PRICE_TO_TIER).length === 0) initPriceTierMap();
  return PRICE_TO_TIER[priceId] ?? "free";
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string
): Promise<{ url: string }> {
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://pointsaware.vercel.app"}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://pointsaware.vercel.app"}/pricing`,
    metadata: { userId },
  });

  return { url: session.url! };
}

export async function createCustomerPortalSession(
  stripeCustomerId: string
): Promise<{ url: string }> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://pointsaware.vercel.app"}/settings`,
  });

  return { url: session.url };
}

export async function constructWebhookEvent(
  rawBody: string,
  signature: string
): Promise<Stripe.Event> {
  return getStripe().webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

export interface SubscriptionUpdate {
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  subscriptionTier: SubscriptionTier;
}

export function parseSubscriptionEvent(
  event: Stripe.Event
): { userId: string; update: SubscriptionUpdate } | null {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) return null;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;
      return {
        userId,
        update: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          subscriptionTier: "pro", // Default — updated by subscription.updated event
        },
      };
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price.id;
      return {
        userId: sub.metadata?.userId ?? "",
        update: {
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          subscriptionTier: priceId ? tierFromPriceId(priceId) : "pro",
        },
      };
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      return {
        userId: sub.metadata?.userId ?? "",
        update: {
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: null,
          subscriptionTier: "free",
        },
      };
    }
    default:
      return null;
  }
}
