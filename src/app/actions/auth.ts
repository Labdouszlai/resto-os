"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants, members, branches } from "@/lib/db/schema";
import { headers } from "next/headers";
import { slugify } from "@/lib/slugify";

export async function signInAction(email: string, password: string) {
  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
        callbackURL: "/dashboard",
      },
    });
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign in failed";
    return { success: false, error: message };
  }
}

export async function signUpAction(
  name: string,
  email: string,
  password: string
) {
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    const restaurantSlug = slugify(name + "'s Restaurant");

    const [restaurant] = await db
      .insert(restaurants)
      .values({
        name: name + "'s Restaurant",
        slug: restaurantSlug,
        currency: "USD",
      })
      .returning();

    const [branch] = await db
      .insert(branches)
      .values({
        restaurantId: restaurant.id,
        name: "Main Branch",
        isActive: true,
      })
      .returning();

    await db.insert(members).values({
      userId: result.user.id,
      restaurantId: restaurant.id,
      role: "owner",
      branchId: branch.id,
    });

    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign up failed";
    return { success: false, error: message };
  }
}

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign out failed";
    return { success: false, error: message };
  }
}

export async function forgotPasswordAction(email: string) {
  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: "/reset-password",
      },
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send reset email";
    return { success: false, error: message };
  }
}

export async function resetPasswordAction(password: string, token: string) {
  try {
    await auth.api.resetPassword({
      body: {
        newPassword: password,
        token,
      },
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset password";
    return { success: false, error: message };
  }
}
