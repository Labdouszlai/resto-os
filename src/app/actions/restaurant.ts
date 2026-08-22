"use server";

import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/slugify";

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

export async function updateRestaurant(
  id: string,
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
    const [restaurant] = await db
      .update(restaurants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(restaurants.id, id))
      .returning();
    return { success: true, data: restaurant };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update restaurant";
    return { success: false, error: message };
  }
}

export async function getRestaurant(id: string) {
  try {
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, id),
    });
    return { success: true, data: restaurant };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch restaurant";
    return { success: false, error: message };
  }
}

export async function deleteRestaurant(id: string) {
  try {
    await db.delete(restaurants).where(eq(restaurants.id, id));
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete restaurant";
    return { success: false, error: message };
  }
}

export async function getCurrentRestaurant() {
  try {
    const { requireRestaurant } = await import("@/lib/auth/server");
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
