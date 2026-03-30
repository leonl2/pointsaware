import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, desc, lt, count } from "drizzle-orm";

export async function getUserNotifications(
  userId: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}
) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
  return result?.count ?? 0;
}

export async function createNotification(data: {
  userId: string;
  alertId?: string;
  title: string;
  body: string;
  link?: string;
}) {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId: data.userId,
      alertId: data.alertId ?? null,
      title: data.title,
      body: data.body,
      link: data.link ?? null,
    })
    .returning();
  return notification;
}

export async function markAsRead(userId: string, notificationId: string) {
  const [updated] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    )
    .returning();
  return updated ?? null;
}

export async function markAllAsRead(userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
}

export async function deleteNotification(
  userId: string,
  notificationId: string
) {
  await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    );
}

export async function deleteOldReadNotifications(olderThanDays: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  await db
    .delete(notifications)
    .where(
      and(eq(notifications.isRead, true), lt(notifications.createdAt, cutoff))
    );
}
