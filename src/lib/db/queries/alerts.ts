import { db } from "@/lib/db";
import { alerts, savedSearches } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getUserAlerts(userId: string) {
  return db
    .select({
      id: alerts.id,
      userId: alerts.userId,
      searchId: alerts.searchId,
      alertType: alerts.alertType,
      thresholdPoints: alerts.thresholdPoints,
      channels: alerts.channels,
      isActive: alerts.isActive,
      lastTriggered: alerts.lastTriggered,
      createdAt: alerts.createdAt,
      // Join saved search fields for display
      origin: savedSearches.origin,
      destination: savedSearches.destination,
      cabinClasses: savedSearches.cabinClasses,
      departureStart: savedSearches.departureStart,
      departureEnd: savedSearches.departureEnd,
    })
    .from(alerts)
    .innerJoin(savedSearches, eq(alerts.searchId, savedSearches.id))
    .where(eq(alerts.userId, userId))
    .orderBy(desc(alerts.createdAt));
}

export async function getActiveAlerts() {
  return db
    .select({
      id: alerts.id,
      userId: alerts.userId,
      searchId: alerts.searchId,
      alertType: alerts.alertType,
      thresholdPoints: alerts.thresholdPoints,
      channels: alerts.channels,
      lastTriggered: alerts.lastTriggered,
      origin: savedSearches.origin,
      destination: savedSearches.destination,
      cabinClasses: savedSearches.cabinClasses,
      departureStart: savedSearches.departureStart,
      departureEnd: savedSearches.departureEnd,
    })
    .from(alerts)
    .innerJoin(savedSearches, eq(alerts.searchId, savedSearches.id))
    .where(eq(alerts.isActive, true));
}

export async function getActiveAlertCount(userId: string) {
  const result = await db
    .select({ id: alerts.id })
    .from(alerts)
    .where(and(eq(alerts.userId, userId), eq(alerts.isActive, true)));
  return result.length;
}

export async function createAlert(data: {
  userId: string;
  searchId: string;
  alertType: string;
  thresholdPoints?: number;
  channels: string[];
}) {
  const [alert] = await db
    .insert(alerts)
    .values({
      userId: data.userId,
      searchId: data.searchId,
      alertType: data.alertType,
      thresholdPoints: data.thresholdPoints ?? null,
      channels: data.channels,
    })
    .returning();
  return alert;
}

export async function updateAlert(
  userId: string,
  alertId: string,
  data: { isActive?: boolean; thresholdPoints?: number; channels?: string[] }
) {
  const [updated] = await db
    .update(alerts)
    .set(data)
    .where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
    .returning();
  return updated ?? null;
}

export async function deleteAlert(userId: string, alertId: string) {
  await db
    .delete(alerts)
    .where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)));
}

export async function markAlertTriggered(alertId: string) {
  await db
    .update(alerts)
    .set({ lastTriggered: new Date() })
    .where(eq(alerts.id, alertId));
}
