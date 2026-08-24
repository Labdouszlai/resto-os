"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants, members, branches } from "@/lib/db/schema";
import { slugify } from "@/lib/slugify";

interface OnboardingInput {
  restaurantName: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string;
  taxRate?: string;
  branchName: string;
  branchAddress?: string;
}

export async function completeOnboardingAction(input: OnboardingInput) {
  try {
    const session = await auth.api.getSession({
      headers: await import("next/headers").then((m) => m.headers()),
    });

    if (!session?.user) {
      return { success: false, error: "Not authenticated" };
    }

    const restaurantSlug = slugify(input.restaurantName);

    const [restaurant] = await db
      .insert(restaurants)
      .values({
        name: input.restaurantName,
        slug: restaurantSlug,
        phone: input.phone,
        address: input.address,
        city: input.city,
        country: input.country || "US",
        currency: input.currency || "USD",
        taxRate: input.taxRate || "0",
      })
      .returning();

    const [branch] = await db
      .insert(branches)
      .values({
        restaurantId: restaurant.id,
        name: input.branchName,
        address: input.branchAddress,
        isActive: true,
      })
      .returning();

    await db.insert(members).values({
      userId: session.user.id,
      restaurantId: restaurant.id,
      role: "owner",
      branchId: branch.id,
    });

    return { success: true, restaurantId: restaurant.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete onboarding";
    return { success: false, error: message };
  }
}
