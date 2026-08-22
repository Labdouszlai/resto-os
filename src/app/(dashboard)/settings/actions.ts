"use server";

import { db } from "@/lib/db";
import { restaurants, branches, users } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/auth/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSettingsData() {
  try {
    const authData = await requireRestaurant();
    const branchResults = await db.query.branches.findMany({
      where: eq(branches.restaurantId, authData.restaurant.id),
      orderBy: (b, { asc }) => [asc(b.name)],
    });

    const user = await db.query.users.findFirst({
      where: eq(users.id, authData.user.id),
    });

    return {
      success: true,
      restaurant: authData.restaurant,
      branches: branchResults,
      user,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load settings";
    return { success: false, error: message, restaurant: null, branches: [], user: null };
  }
}

export async function updateRestaurantSettings(data: {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  currency?: string;
  taxRate?: number;
}) {
  try {
    const { restaurant } = await requireRestaurant();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.taxRate !== undefined) updateData.taxRate = data.taxRate.toString();

    const [updated] = await db
      .update(restaurants)
      .set(updateData)
      .where(eq(restaurants.id, restaurant.id))
      .returning();

    if (!updated) throw new Error("Restaurant not found");

    revalidatePath("/settings");
    return { success: true, restaurant: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update restaurant";
    return { success: false, error: message };
  }
}

export async function createBranchAction(data: {
  name: string;
  address?: string;
  phone?: string;
}) {
  try {
    const { restaurant } = await requireRestaurant();

    const [branch] = await db
      .insert(branches)
      .values({
        restaurantId: restaurant.id,
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        isActive: true,
      })
      .returning();

    revalidatePath("/settings");
    return { success: true, branch };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create branch";
    return { success: false, error: message };
  }
}

export async function updateBranchAction(
  branchId: string,
  data: { name?: string; address?: string; phone?: string; isActive?: boolean }
) {
  try {
    const { restaurant } = await requireRestaurant();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updated] = await db
      .update(branches)
      .set(updateData)
      .where(and(eq(branches.id, branchId), eq(branches.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Branch not found");

    revalidatePath("/settings");
    return { success: true, branch: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update branch";
    return { success: false, error: message };
  }
}

export async function deleteBranchAction(branchId: string) {
  try {
    const { restaurant } = await requireRestaurant();

    const [deleted] = await db
      .delete(branches)
      .where(and(eq(branches.id, branchId), eq(branches.restaurantId, restaurant.id)))
      .returning();

    if (!deleted) throw new Error("Branch not found");

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete branch";
    return { success: false, error: message };
  }
}

export async function getBranchesAction() {
  try {
    const { restaurant } = await requireRestaurant();

    const results = await db.query.branches.findMany({
      where: eq(branches.restaurantId, restaurant.id),
      orderBy: (b, { asc }) => [asc(b.name)],
    });

    return { success: true, branches: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch branches";
    return { success: false, error: message, branches: [] };
  }
}

export async function updateProfileAction(data: { name?: string; email?: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) throw new Error("Unauthorized");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id))
      .returning();

    if (!updated) throw new Error("User not found");

    revalidatePath("/settings");
    return { success: true, user: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return { success: false, error: message };
  }
}

export async function getProfileAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) throw new Error("Unauthorized");

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    return { success: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    return { success: false, error: message };
  }
}

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) throw new Error("Unauthorized");

    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
      },
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to change password";
    return { success: false, error: message };
  }
}
