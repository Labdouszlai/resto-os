"use server";

import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/slugify";
import { requireRestaurant, requirePermission } from "@/lib/auth/server";

export async function updateRestaurant(
  data: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    currency?: string;
    taxRate?: string;
    timezone?: string;
  }
) {
  try {
    const { restaurant, member } = await requirePermission("restaurant:manage");

    const [updated] = await db
      .update(restaurants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(restaurants.id, restaurant.id))
      .returning();
    return { success: true, data: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update restaurant";
    return { success: false, error: message };
  }
}

export async function getMyRestaurant() {
  try {
    const { restaurant } = await requireRestaurant();
    return { success: true, data: restaurant };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch restaurant";
    return { success: false, error: message };
  }
}

export async function getCurrentRestaurant() {
  try {
    const session = await requireRestaurant();
    return {
      userId: session.user.id,
      restaurant: session.restaurant,
      member: session.member,
    };
  } catch {
    return null;
  }
}

export async function createRestaurant(data: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string;
  taxRate?: string;
  timezone?: string;
}) {
  try {
    const slug = slugify(data.name);
    const [restaurant] = await db
      .insert(restaurants)
      .values({
        name: data.name,
        slug,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        country: data.country,
        currency: data.currency || "USD",
        taxRate: data.taxRate || "0",
        timezone: data.timezone,
      })
      .returning();
    return { success: true, data: restaurant };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create restaurant";
    return { success: false, error: message };
  }
}

export async function deleteRestaurant() {
  try {
    const { restaurant } = await requirePermission("restaurant:manage");
    await db.delete(restaurants).where(eq(restaurants.id, restaurant.id));
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete restaurant";
    return { success: false, error: message };
  }
}
