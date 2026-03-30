import { markAlertTriggered } from "@/lib/db/queries/alerts";
import { detectPriceDrop } from "@/lib/db/queries/price-history";
import { buildRouteKey } from "@/lib/db/queries/price-history";
import { sendNotification } from "./notifications";

interface ActiveAlert {
  id: string;
  userId: string;
  alertType: string;
  thresholdPoints: number | null;
  channels: string[];
  lastTriggered: Date | null;
  origin: string;
  destination: string | null;
  cabinClasses: string[];
  departureStart: string;
  departureEnd: string;
}

interface DealForAlert {
  airline: string;
  pointsPrice: number;
  departureDate: string;
  origin: string;
  destination: string;
  cabinClass: string;
  program: string;
}

const THROTTLE_HOURS = 6;

function isThrottled(lastTriggered: Date | null): boolean {
  if (!lastTriggered) return false;
  const hoursAgo =
    (Date.now() - lastTriggered.getTime()) / (1000 * 60 * 60);
  return hoursAgo < THROTTLE_HOURS;
}

/**
 * Evaluate a single alert against current deals and send notifications if triggered.
 */
export async function evaluateAlert(
  alert: ActiveAlert,
  deals: DealForAlert[]
): Promise<{ triggered: boolean; matchingDeal?: DealForAlert }> {
  if (isThrottled(alert.lastTriggered)) {
    return { triggered: false };
  }

  // Filter deals to those matching this alert's route and cabin
  const matchingDeals = deals.filter((deal) => {
    const routeMatch =
      deal.origin === alert.origin &&
      (!alert.destination || deal.destination === alert.destination);
    const cabinMatch = alert.cabinClasses.includes(deal.cabinClass);
    return routeMatch && cabinMatch;
  });

  if (matchingDeals.length === 0) {
    return { triggered: false };
  }

  if (alert.alertType === "price_drop" && alert.thresholdPoints) {
    const bestDeal = matchingDeals.reduce((best, deal) =>
      deal.pointsPrice < best.pointsPrice ? deal : best
    );

    if (bestDeal.pointsPrice <= alert.thresholdPoints) {
      await processAlertTrigger(alert, bestDeal);
      return { triggered: true, matchingDeal: bestDeal };
    }
  }

  if (alert.alertType === "availability") {
    // Any matching deal triggers an availability alert
    const bestDeal = matchingDeals.reduce((best, deal) =>
      deal.pointsPrice < best.pointsPrice ? deal : best
    );
    await processAlertTrigger(alert, bestDeal);
    return { triggered: true, matchingDeal: bestDeal };
  }

  return { triggered: false };
}

async function processAlertTrigger(alert: ActiveAlert, deal: DealForAlert) {
  await sendNotification(
    {
      id: alert.id,
      userId: alert.userId,
      alertType: alert.alertType,
      thresholdPoints: alert.thresholdPoints,
      channels: alert.channels,
      origin: alert.origin,
      destination: alert.destination,
      cabinClasses: alert.cabinClasses,
    },
    deal
  );
  await markAlertTriggered(alert.id);
}
