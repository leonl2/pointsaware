import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "@/lib/db/queries/notifications";
import { sendAlertEmail } from "./email";
import { sendPushNotification } from "./web-push";
import { sendSms } from "./sms";

interface AlertInfo {
  id: string;
  userId: string;
  alertType: string;
  thresholdPoints: number | null;
  channels: string[];
  origin: string;
  destination: string | null;
  cabinClasses: string[];
}

interface DealInfo {
  airline: string;
  pointsPrice: number;
  departureDate: string;
  origin: string;
  destination: string;
  cabinClass: string;
}

/**
 * Dispatch notifications for a triggered alert across all enabled channels.
 */
export async function sendNotification(
  alert: AlertInfo,
  deal: DealInfo
) {
  const route = `${deal.origin} → ${deal.destination}`;
  const title =
    alert.alertType === "price_drop"
      ? `Price Drop: ${route}`
      : `New Availability: ${route}`;
  const body = `${deal.airline} ${deal.cabinClass} — ${deal.pointsPrice.toLocaleString()} pts on ${deal.departureDate}`;
  const link = `/search?origin=${deal.origin}&destination=${deal.destination}`;

  const results: { channel: string; success: boolean; error?: string }[] = [];

  for (const channel of alert.channels) {
    try {
      switch (channel) {
        case "in_app":
          await createNotification({
            userId: alert.userId,
            alertId: alert.id,
            title,
            body,
            link,
          });
          results.push({ channel, success: true });
          break;

        case "email": {
          const [user] = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, alert.userId))
            .limit(1);
          if (user?.email) {
            await sendAlertEmail(user.email, alert, {
              airline: deal.airline,
              pointsPrice: deal.pointsPrice,
              departureDate: deal.departureDate,
            });
            results.push({ channel, success: true });
          }
          break;
        }

        case "push": {
          const [pushUser] = await db
            .select({ pushSubscription: users.pushSubscription })
            .from(users)
            .where(eq(users.id, alert.userId))
            .limit(1);
          if (pushUser?.pushSubscription) {
            await sendPushNotification(
              pushUser.pushSubscription as Parameters<typeof sendPushNotification>[0],
              { title, body, url: link }
            );
            results.push({ channel, success: true });
          } else {
            results.push({ channel, success: false, error: "No push subscription" });
          }
          break;
        }

        case "sms": {
          const [smsUser] = await db
            .select({ phone: users.phone, subscriptionTier: users.subscriptionTier })
            .from(users)
            .where(eq(users.id, alert.userId))
            .limit(1);
          if (smsUser?.phone && smsUser.subscriptionTier === "premium") {
            await sendSms(smsUser.phone, `${title}: ${body}`);
            results.push({ channel, success: true });
          } else {
            results.push({ channel, success: false, error: smsUser?.phone ? "SMS requires premium" : "No phone number" });
          }
          break;
        }
      }
    } catch (err) {
      results.push({
        channel,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return results;
}
