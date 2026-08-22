"use server";

import { db } from "@/lib/db";
import { tables, orders } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/server";
import { eq, and } from "drizzle-orm";
import { tableSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createTable(data: { number: number; capacity: number; branchId: string }) {
  try {
    const { restaurant } = await requirePermission("tables:create");
    const parsed = tableSchema.parse(data);

    const [table] = await db
      .insert(tables)
      .values({
        restaurantId: restaurant.id,
        branchId: data.branchId,
        number: parsed.number.toString(),
        capacity: parsed.capacity,
        status: "available",
      })
      .returning();

    revalidatePath("/tables");
    return { success: true, table };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create table";
    return { success: false, error: message };
  }
}

export async function updateTable(tableId: string, data: { number?: number; capacity?: number }) {
  try {
    const { restaurant } = await requirePermission("tables:edit");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.number !== undefined) updateData.number = data.number.toString();
    if (data.capacity !== undefined) updateData.capacity = data.capacity;

    const [updated] = await db
      .update(tables)
      .set(updateData)
      .where(and(eq(tables.id, tableId), eq(tables.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Table not found");

    revalidatePath("/tables");
    return { success: true, table: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update table";
    return { success: false, error: message };
  }
}

export async function deleteTable(tableId: string) {
  try {
    const { restaurant } = await requirePermission("tables:delete");

    const [deleted] = await db
      .delete(tables)
      .where(and(eq(tables.id, tableId), eq(tables.restaurantId, restaurant.id)))
      .returning();

    if (!deleted) throw new Error("Table not found");

    revalidatePath("/tables");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete table";
    return { success: false, error: message };
  }
}

export async function getTables(branchId?: string) {
  try {
    const { restaurant } = await requirePermission("tables:view");

    const conditions = [eq(tables.restaurantId, restaurant.id)];
    if (branchId) {
      conditions.push(eq(tables.branchId, branchId));
    }

    const results = await db.query.tables.findMany({
      where: and(...conditions),
      orderBy: [tables.number],
    });

    return { success: true, tables: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch tables";
    return { success: false, error: message, tables: [] };
  }
}

export async function updateTableStatus(tableId: string, status: string) {
  try {
    const { restaurant } = await requirePermission("tables:assign");

    const [updated] = await db
      .update(tables)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(tables.id, tableId), eq(tables.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Table not found");

    revalidatePath("/tables");
    return { success: true, table: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update table status";
    return { success: false, error: message };
  }
}

export async function assignOrder(tableId: string, orderId: string) {
  try {
    const { restaurant } = await requirePermission("tables:assign");

    const [updated] = await db
      .update(orders)
      .set({ tableId, updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Order not found");

    await db
      .update(tables)
      .set({ status: "occupied", updatedAt: new Date() })
      .where(eq(tables.id, tableId));

    revalidatePath("/tables");
    revalidatePath("/orders");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to assign order";
    return { success: false, error: message };
  }
}
