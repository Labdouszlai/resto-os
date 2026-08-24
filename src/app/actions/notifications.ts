"use server";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRestaurant } from "@/lib/auth/server";

export async function getNotifications(userId?: string) {
  try {
    const { restaurant } = await requireRestaurant();
    const conditions = [eq(notifications.restaurantId, restaurant.id)];
    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }

    const results = await db.query.notifications.findMany({
      where: and(...conditions),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    });

    return { success: true, notifications: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch notifications";
    return { success: false, error: message, notifications: [] };
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const { restaurant } = await requireRestaurant();
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Notification not found");

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark notification as read";
    return { success: false, error: message };
  }
}

export async function markAllAsRead(userId?: string) {
  try {
    const { restaurant } = await requireRestaurant();
    const conditions = [
      eq(notifications.restaurantId, restaurant.id),
      eq(notifications.isRead, false),
    ];
    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(...conditions));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark all as read";
    return { success: false, error: message };
  }
}

export async function createNotification(
  data: {
    userId?: string;
    title: string;
    message: string;
    type: string;
  }
) {
  try {
    const { restaurant } = await requireRestaurant();
    const [notification] = await db
      .insert(notifications)
      .values({
        restaurantId: restaurant.id,
        userId: data.userId || null,
        title: data.title,
        message: data.message,
        type: data.type,
      })
      .returning();

    return { success: true, notification };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create notification";
    return { success: false, error: message };
  }
}

export async function getUnreadCount(userId?: string) {
  try {
    const { restaurant } = await requireRestaurant();
    const conditions = [
      eq(notifications.restaurantId, restaurant.id),
      eq(notifications.isRead, false),
    ];
    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }

    const [result] = await db
      .select({ value: count() })
      .from(notifications)
      .where(and(...conditions));

    return { success: true, count: result.value };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get unread count";
    return { success: false, error: message, count: 0 };
  }
}
