"use server";

import { db } from "@/lib/db";
import { ingredients, inventoryMovements } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/server";
import { eq, and, ilike, desc } from "drizzle-orm";
import { ingredientSchema } from "@/lib/validations";
import { toNumber } from "@/lib/format";
import { revalidatePath } from "next/cache";

export async function createIngredient(data: {
  name: string;
  sku: string;
  unit: string;
  currentStock?: number;
  minimumStock?: number;
  costPerUnit?: number;
  supplierId?: string;
  expirationDate?: string;
}) {
  try {
    const { restaurant } = await requirePermission("inventory:create");
    const parsed = ingredientSchema.parse(data);

    const [ingredient] = await db
      .insert(ingredients)
      .values({
        restaurantId: restaurant.id,
        name: parsed.name,
        sku: parsed.sku,
        unit: parsed.unit,
        currentStock: (parsed.currentStock ?? 0).toString(),
        minimumStock: (parsed.minimumStock ?? 0).toString(),
        costPerUnit: (parsed.costPerUnit ?? 0).toString(),
        supplierId: parsed.supplierId || null,
        expirationDate: parsed.expirationDate || null,
      })
      .returning();

    revalidatePath("/inventory");
    return { success: true, ingredient };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create ingredient";
    return { success: false, error: message };
  }
}

export async function updateIngredient(
  ingredientId: string,
  data: {
    name?: string;
    sku?: string;
    unit?: string;
    currentStock?: number;
    minimumStock?: number;
    costPerUnit?: number;
    supplierId?: string;
    expirationDate?: string;
  }
) {
  try {
    const { restaurant } = await requirePermission("inventory:edit");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.currentStock !== undefined) updateData.currentStock = data.currentStock.toString();
    if (data.minimumStock !== undefined) updateData.minimumStock = data.minimumStock.toString();
    if (data.costPerUnit !== undefined) updateData.costPerUnit = data.costPerUnit.toString();
    if (data.supplierId !== undefined) updateData.supplierId = data.supplierId;
    if (data.expirationDate !== undefined) updateData.expirationDate = data.expirationDate;

    const [updated] = await db
      .update(ingredients)
      .set(updateData)
      .where(and(eq(ingredients.id, ingredientId), eq(ingredients.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Ingredient not found");

    revalidatePath("/inventory");
    return { success: true, ingredient: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update ingredient";
    return { success: false, error: message };
  }
}

export async function deleteIngredient(ingredientId: string) {
  try {
    const { restaurant } = await requirePermission("inventory:delete");

    const [deleted] = await db
      .delete(ingredients)
      .where(and(eq(ingredients.id, ingredientId), eq(ingredients.restaurantId, restaurant.id)))
      .returning();

    if (!deleted) throw new Error("Ingredient not found");

    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete ingredient";
    return { success: false, error: message };
  }
}

export async function getIngredients(filters?: { search?: string; supplierId?: string }) {
  try {
    const { restaurant } = await requirePermission("inventory:view");

    const conditions = [eq(ingredients.restaurantId, restaurant.id)];
    if (filters?.search) {
      conditions.push(ilike(ingredients.name, `%${filters.search}%`));
    }
    if (filters?.supplierId) {
      conditions.push(eq(ingredients.supplierId, filters.supplierId));
    }

    const results = await db.query.ingredients.findMany({
      where: and(...conditions),
      with: { supplier: true },
      orderBy: [ingredients.name],
    });

    return { success: true, ingredients: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch ingredients";
    return { success: false, error: message, ingredients: [] };
  }
}

export async function adjustStock(ingredientId: string, type: string, quantity: number, notes?: string) {
  try {
    const { restaurant } = await requirePermission("inventory:adjust");

    const ingredient = await db.query.ingredients.findFirst({
      where: and(eq(ingredients.id, ingredientId), eq(ingredients.restaurantId, restaurant.id)),
    });

    if (!ingredient) throw new Error("Ingredient not found");

    const current = toNumber(ingredient.currentStock);
    let newStock: number;

    switch (type) {
      case "addition":
        newStock = current + quantity;
        break;
      case "deduction":
        newStock = Math.max(0, current - quantity);
        break;
      case "adjustment":
        newStock = quantity;
        break;
      default:
        throw new Error("Invalid adjustment type");
    }

    await db
      .update(ingredients)
      .set({ currentStock: newStock.toString(), updatedAt: new Date() })
      .where(and(eq(ingredients.id, ingredientId), eq(ingredients.restaurantId, restaurant.id)));

    await db.insert(inventoryMovements).values({
      restaurantId: restaurant.id,
      ingredientId,
      type,
      quantity: quantity.toString(),
      notes: notes || null,
    });

    revalidatePath("/inventory");
    return { success: true, newStock };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to adjust stock";
    return { success: false, error: message };
  }
}

export async function getStockMovements(ingredientId?: string) {
  try {
    const { restaurant } = await requirePermission("inventory:view");

    const conditions = [eq(inventoryMovements.restaurantId, restaurant.id)];
    if (ingredientId) {
      conditions.push(eq(inventoryMovements.ingredientId, ingredientId));
    }

    const results = await db.query.inventoryMovements.findMany({
      where: and(...conditions),
      with: { ingredient: true },
      orderBy: [desc(inventoryMovements.createdAt)],
      limit: 100,
    });

    return { success: true, movements: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch stock movements";
    return { success: false, error: message, movements: [] };
  }
}

export async function getLowStockItems() {
  try {
    const { restaurant } = await requirePermission("inventory:view");

    const results = await db.query.ingredients.findMany({
      where: eq(ingredients.restaurantId, restaurant.id),
    });

    const lowStock = results.filter((i) => {
      const current = toNumber(i.currentStock);
      const minimum = toNumber(i.minimumStock);
      return minimum > 0 && current <= minimum;
    });

    return { success: true, items: lowStock };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch low stock items";
    return { success: false, error: message, items: [] };
  }
}
