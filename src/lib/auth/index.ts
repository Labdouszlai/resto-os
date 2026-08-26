import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "resto-os-dev-secret-change-in-production",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verification,
      restaurant: schema.restaurants,
      branch: schema.branches,
      member: schema.members,
      customer: schema.customers,
      employee: schema.employees,
      expense: schema.expenses,
      ingredient: schema.ingredients,
      inventoryMovement: schema.inventoryMovements,
      menuCategory: schema.menuCategories,
      menuItem: schema.menuItems,
      menuItemModifier: schema.menuItemModifiers,
      modifier: schema.modifiers,
      notification: schema.notifications,
      order: schema.orders,
      orderItem: schema.orderItems,
      orderItemModifier: schema.orderItemModifiers,
      payment: schema.payments,
      purchaseOrder: schema.purchaseOrders,
      purchaseOrderItem: schema.purchaseOrderItems,
      recipe: schema.recipes,
      recipeItem: schema.recipeItems,
      reservation: schema.reservations,
      supplier: schema.suppliers,
      table: schema.tables,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {},
  },
  advanced: {
    cookiePrefix: "better-auth",
  },
});

export type Session = typeof auth.$Infer.Session;
