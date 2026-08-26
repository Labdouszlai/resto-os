"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants, members, branches } from "@/lib/db/schema";
import { headers, cookies } from "next/headers";
import { slugify } from "@/lib/slugify";

export async function setupRestaurantAction(userId: string, name: string) {
  try {
    const existing = await db.query.members.findFirst({
      where: (m, { eq }) => eq(m.userId, userId),
    });
    if (existing) return { success: true };

    const restaurantSlug = slugify(name + "'s Restaurant");
    const [restaurant] = await db
      .insert(restaurants)
      .values({ name: name + "'s Restaurant", slug: restaurantSlug, currency: "USD" })
      .returning();
    const [branch] = await db
      .insert(branches)
      .values({ restaurantId: restaurant.id, name: "Main Branch", isActive: true })
      .returning();
    await db.insert(members).values({
      userId,
      restaurantId: restaurant.id,
      role: "owner",
      branchId: branch.id,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Setup failed";
    return { success: false, error: message };
  }
}

export async function signOutAction() {
  try {
    await auth.api.signOut({ headers: await headers() });
    const c = await cookies();
    c.delete("better-auth.session_token");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Sign out failed" };
  }
}

export async function forgotPasswordAction(email: string) {
  try {
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: "/reset-password" },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send reset email" };
  }
}

export async function resetPasswordAction(password: string, token: string) {
  try {
    await auth.api.resetPassword({
      body: { newPassword: password, token },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to reset password" };
  }
}
