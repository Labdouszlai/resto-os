"use server";

import { db } from "@/lib/db";
import { branches } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/auth/server";
import { eq, and } from "drizzle-orm";

export async function createBranch(data: {
  restaurantId: string;
  name: string;
  address?: string;
  phone?: string;
}) {
  try {
    const [branch] = await db
      .insert(branches)
      .values({
        restaurantId: data.restaurantId,
        name: data.name,
        address: data.address,
        phone: data.phone,
        isActive: true,
      })
      .returning();
    return { success: true, data: branch };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create branch";
    return { success: false, error: message };
  }
}

export async function updateBranch(
  id: string,
  restaurantId: string,
  data: {
    name?: string;
    address?: string;
    phone?: string;
    isActive?: boolean;
  }
) {
  try {
    const [branch] = await db
      .update(branches)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(branches.id, id), eq(branches.restaurantId, restaurantId)))
      .returning();
    return { success: true, data: branch };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update branch";
    return { success: false, error: message };
  }
}

export async function getBranches(restaurantId: string) {
  try {
    const data = await db.query.branches.findMany({
      where: eq(branches.restaurantId, restaurantId),
      orderBy: (branches, { asc }) => [asc(branches.name)],
    });
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch branches";
    return { success: false, error: message };
  }
}

export async function deleteBranch(id: string, restaurantId: string) {
  try {
    await db
      .delete(branches)
      .where(and(eq(branches.id, id), eq(branches.restaurantId, restaurantId)));
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete branch";
    return { success: false, error: message };
  }
}

export async function getMyBranches() {
  try {
    const { restaurant } = await requireRestaurant();
    const data = await db.query.branches.findMany({
      where: eq(branches.restaurantId, restaurant.id),
      orderBy: (branches, { asc }) => [asc(branches.name)],
    });
    return { success: true, branches: data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch branches";
    return { success: false, error: message, branches: [] };
  }
}
