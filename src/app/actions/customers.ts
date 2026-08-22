"use server";

import { db } from "@/lib/db";
import { customers, orders } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/server";
import { eq, and, ilike, desc } from "drizzle-orm";
import { customerSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createCustomer(data: { name: string; email?: string; phone?: string; address?: string; notes?: string }) {
  try {
    const { restaurant } = await requirePermission("customers:create");
    const parsed = customerSchema.parse(data);

    const [customer] = await db
      .insert(customers)
      .values({
        restaurantId: restaurant.id,
        name: parsed.name,
        email: parsed.email || null,
        phone: parsed.phone || null,
        address: parsed.address || null,
        notes: parsed.notes || null,
      })
      .returning();

    revalidatePath("/customers");
    return { success: true, customer };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create customer";
    return { success: false, error: message };
  }
}

export async function updateCustomer(
  customerId: string,
  data: { name?: string; email?: string; phone?: string; address?: string; notes?: string }
) {
  try {
    const { restaurant } = await requirePermission("customers:edit");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const [updated] = await db
      .update(customers)
      .set(updateData)
      .where(and(eq(customers.id, customerId), eq(customers.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Customer not found");

    revalidatePath("/customers");
    return { success: true, customer: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update customer";
    return { success: false, error: message };
  }
}

export async function deleteCustomer(customerId: string) {
  try {
    const { restaurant } = await requirePermission("customers:delete");

    const [deleted] = await db
      .delete(customers)
      .where(and(eq(customers.id, customerId), eq(customers.restaurantId, restaurant.id)))
      .returning();

    if (!deleted) throw new Error("Customer not found");

    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete customer";
    return { success: false, error: message };
  }
}

export async function getCustomers(search?: string) {
  try {
    const { restaurant } = await requirePermission("customers:view");

    const conditions = [eq(customers.restaurantId, restaurant.id)];
    if (search) {
      conditions.push(ilike(customers.name, `%${search}%`));
    }

    const results = await db.query.customers.findMany({
      where: and(...conditions),
      orderBy: [desc(customers.createdAt)],
    });

    return { success: true, customers: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch customers";
    return { success: false, error: message, customers: [] };
  }
}

export async function getCustomer(customerId: string) {
  try {
    const { restaurant } = await requirePermission("customers:view");

    const customer = await db.query.customers.findFirst({
      where: and(eq(customers.id, customerId), eq(customers.restaurantId, restaurant.id)),
    });

    if (!customer) throw new Error("Customer not found");

    const orderHistory = await db.query.orders.findMany({
      where: eq(orders.customerId, customerId),
      orderBy: [desc(orders.createdAt)],
      limit: 50,
    });

    return { success: true, customer, orderHistory };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch customer";
    return { success: false, error: message };
  }
}
