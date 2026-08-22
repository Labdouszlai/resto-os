"use server";

import { db } from "@/lib/db";
import { purchaseOrders, purchaseOrderItems, ingredients, inventoryMovements } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/server";
import { eq, and, desc } from "drizzle-orm";
import { purchaseOrderSchema } from "@/lib/validations";
import { toNumber } from "@/lib/format";
import { revalidatePath } from "next/cache";

export async function createPurchaseOrder(data: {
  supplierId: string;
  items: { ingredientId: string; quantity: number; unitCost: number }[];
  tax?: number;
  notes?: string;
}) {
  try {
    const { restaurant } = await requirePermission("purchases:create");
    const parsed = purchaseOrderSchema.parse(data);

    const total = parsed.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

    const [po] = await db
      .insert(purchaseOrders)
      .values({
        restaurantId: restaurant.id,
        supplierId: parsed.supplierId,
        status: "draft",
        total: total.toString(),
        tax: (parsed.tax ?? 0).toString(),
        notes: parsed.notes || null,
      })
      .returning();

    for (const item of parsed.items) {
      await db.insert(purchaseOrderItems).values({
        purchaseOrderId: po.id,
        ingredientId: item.ingredientId,
        quantity: item.quantity.toString(),
        unitCost: item.unitCost.toString(),
        subtotal: (item.quantity * item.unitCost).toString(),
      });
    }

    revalidatePath("/purchases");
    return { success: true, purchaseOrder: po };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create purchase order";
    return { success: false, error: message };
  }
}

export async function updatePurchaseOrder(poId: string, data: { status?: string; notes?: string }) {
  try {
    const { restaurant } = await requirePermission("purchases:edit");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const [updated] = await db
      .update(purchaseOrders)
      .set(updateData)
      .where(and(eq(purchaseOrders.id, poId), eq(purchaseOrders.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Purchase order not found");

    revalidatePath("/purchases");
    return { success: true, purchaseOrder: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update purchase order";
    return { success: false, error: message };
  }
}

export async function receivePurchaseOrder(poId: string) {
  try {
    const { restaurant } = await requirePermission("purchases:edit");

    const po = await db.query.purchaseOrders.findFirst({
      where: and(eq(purchaseOrders.id, poId), eq(purchaseOrders.restaurantId, restaurant.id)),
      with: { items: true },
    }) as (typeof purchaseOrders.$inferSelect & { items: Array<typeof purchaseOrderItems.$inferSelect> }) | undefined;

    if (!po) throw new Error("Purchase order not found");

    for (const item of po.items) {
      const ingredient = await db.query.ingredients.findFirst({
        where: eq(ingredients.id, item.ingredientId),
      });

      if (ingredient) {
        const currentStock = toNumber(ingredient.currentStock);
        const receivedQty = toNumber(item.quantity);

        await db
          .update(ingredients)
          .set({ currentStock: (currentStock + receivedQty).toString(), updatedAt: new Date() })
          .where(eq(ingredients.id, item.ingredientId));

        await db.insert(inventoryMovements).values({
          restaurantId: restaurant.id,
          ingredientId: item.ingredientId,
          type: "addition",
          quantity: receivedQty.toString(),
          referenceId: poId,
          notes: `PO #${po.id.slice(0, 8)} received`,
        });
      }
    }

    await db
      .update(purchaseOrders)
      .set({ status: "received", updatedAt: new Date() })
      .where(eq(purchaseOrders.id, poId));

    revalidatePath("/purchases");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to receive purchase order";
    return { success: false, error: message };
  }
}

export async function cancelPurchaseOrder(poId: string) {
  try {
    const { restaurant } = await requirePermission("purchases:cancel");

    const [updated] = await db
      .update(purchaseOrders)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(and(eq(purchaseOrders.id, poId), eq(purchaseOrders.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Purchase order not found");

    revalidatePath("/purchases");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel purchase order";
    return { success: false, error: message };
  }
}

export async function getPurchaseOrders(filters?: { status?: string }) {
  try {
    const { restaurant } = await requirePermission("purchases:view");

    const conditions = [eq(purchaseOrders.restaurantId, restaurant.id)];
    if (filters?.status && filters.status !== "all") {
      conditions.push(eq(purchaseOrders.status, filters.status));
    }

    const results = await db.query.purchaseOrders.findMany({
      where: and(...conditions),
      with: {
        supplier: true,
        items: { with: { ingredient: true } },
      },
      orderBy: [desc(purchaseOrders.createdAt)],
    });

    return { success: true, purchaseOrders: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch purchase orders";
    return { success: false, error: message, purchaseOrders: [] };
  }
}

export async function getPurchaseOrder(poId: string) {
  try {
    const { restaurant } = await requirePermission("purchases:view");

    const po = await db.query.purchaseOrders.findFirst({
      where: and(eq(purchaseOrders.id, poId), eq(purchaseOrders.restaurantId, restaurant.id)),
      with: {
        supplier: true,
        items: { with: { ingredient: true } },
      },
    });

    if (!po) throw new Error("Purchase order not found");

    return { success: true, purchaseOrder: po };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch purchase order";
    return { success: false, error: message };
  }
}
