"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants, members, branches, users, accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { v4 as uuid } from "uuid";

const DEMO_EMAIL = "demo@restoos.com";
const DEMO_PASSWORD = "demo1234";

export async function demoLoginAction() {
  try {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO !== "true") {
      return { success: false, error: "Demo is not available in production" };
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, DEMO_EMAIL),
    });

    if (!existingUser) {
      const hashedPassword = await hashPassword(DEMO_PASSWORD);
      const userId = uuid();

      await db.insert(users).values({
        id: userId,
        name: "Marco Rossi",
        email: DEMO_EMAIL,
        emailVerified: true,
      });

      await db.insert(accounts).values({
        id: uuid(),
        accountId: DEMO_EMAIL,
        providerId: "credential",
        userId: userId,
        password: hashedPassword,
      });

      const restaurantSlug = "demo-restaurant";
      const [restaurant] = await db
        .insert(restaurants)
        .values({
          name: "La Maison Dorée",
          slug: restaurantSlug,
          phone: "+1-555-0100",
          email: "info@lamaisondoree.com",
          address: "42 Rue de la Paix",
          city: "New York",
          country: "US",
          currency: "USD",
          taxRate: "0.08",
          timezone: "America/New_York",
        })
        .returning();

      const [branch] = await db
        .insert(branches)
        .values({
          restaurantId: restaurant.id,
          name: "Downtown",
          address: "42 Rue de la Paix, New York, NY 10001",
          isActive: true,
        })
        .returning();

      await db.insert(members).values({
        userId,
        restaurantId: restaurant.id,
        role: "owner",
        branchId: branch.id,
      });
    }

    const result = await auth.api.signInEmail({
      body: {
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        callbackURL: "/dashboard",
      },
    });

    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Demo login failed";
    return { success: false, error: message };
  }
}
