"use server";

import { db } from "@/lib/db";
import { payments, orders } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/server";
import { eq, and, desc } from "drizzle-orm";
import { paymentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createPayment(data: {
  orderId: string;
  amount: number;
  method: string;
  reference?: string;
}) {
  try {
    const { restaurant } = await requirePermission("payments:create");
    const parsed = paymentSchema.parse(data);

    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, parsed.orderId), eq(orders.restaurantId, restaurant.id)),
    });

    if (!order) throw new Error("Order not found");

    const [payment] = await db
      .insert(payments)
      .values({
        restaurantId: restaurant.id,
        orderId: parsed.orderId,
        amount: parsed.amount.toString(),
        method: parsed.method,
        status: "completed",
        reference: parsed.reference || null,
      })
      .returning();

    revalidatePath("/orders");
    revalidatePath(`/orders/${parsed.orderId}`);
    return { success: true, payment };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create payment";
    return { success: false, error: message };
  }
}

export async function refundPayment(paymentId: string) {
  try {
    const { restaurant } = await requirePermission("payments:refund");

    const payment = await db.query.payments.findFirst({
      where: and(eq(payments.id, paymentId), eq(payments.restaurantId, restaurant.id)),
    });

    if (!payment) throw new Error("Payment not found");

    const [updated] = await db
      .update(payments)
      .set({ status: "refunded", updatedAt: new Date() })
      .where(and(eq(payments.id, paymentId), eq(payments.restaurantId, restaurant.id)))
      .returning();

    revalidatePath("/orders");
    revalidatePath(`/orders/${payment.orderId}`);
    return { success: true, payment: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to refund payment";
    return { success: false, error: message };
  }
}

export async function getPayments(filters?: { status?: string; method?: string }) {
  try {
    const { restaurant } = await requirePermission("payments:view");

    const conditions = [eq(payments.restaurantId, restaurant.id)];
    if (filters?.status) conditions.push(eq(payments.status, filters.status));
    if (filters?.method) conditions.push(eq(payments.method, filters.method));

    const results = await db.query.payments.findMany({
      where: and(...conditions),
      with: { order: true },
      orderBy: [desc(payments.createdAt)],
    });

    return { success: true, payments: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch payments";
    return { success: false, error: message, payments: [] };
  }
}
