"use server";

import { db } from "@/lib/db";
import { menuCategories, menuItems, modifiers, menuItemModifiers, recipes, recipeItems } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/server";
import { eq, and, asc } from "drizzle-orm";
import { menuCategorySchema, menuItemSchema, modifierSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createCategory(
  data: { name: string; description?: string; sortOrder?: number }
) {
  try {
    const { restaurant } = await requirePermission("menu:create");
    const parsed = menuCategorySchema.parse(data);

    const [category] = await db
      .insert(menuCategories)
      .values({
        restaurantId: restaurant.id,
        name: parsed.name,
        description: parsed.description || null,
        sortOrder: parsed.sortOrder ?? 0,
      })
      .returning();

    revalidatePath("/menu");
    return { success: true, category };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return { success: false, error: message };
  }
}

export async function updateCategory(
  categoryId: string,
  data: { name?: string; description?: string; sortOrder?: number; isActive?: boolean }
) {
  try {
    const { restaurant } = await requirePermission("menu:edit");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updated] = await db
      .update(menuCategories)
      .set(updateData)
      .where(and(eq(menuCategories.id, categoryId), eq(menuCategories.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Category not found");

    revalidatePath("/menu");
    return { success: true, category: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    return { success: false, error: message };
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    const { restaurant } = await requirePermission("menu:delete");

    const [deleted] = await db
      .delete(menuCategories)
      .where(and(eq(menuCategories.id, categoryId), eq(menuCategories.restaurantId, restaurant.id)))
      .returning();

    if (!deleted) throw new Error("Category not found");

    revalidatePath("/menu");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return { success: false, error: message };
  }
}

export async function getCategories() {
  try {
    const { restaurant } = await requirePermission("menu:view");

    const results = await db.query.menuCategories.findMany({
      where: eq(menuCategories.restaurantId, restaurant.id),
      orderBy: [asc(menuCategories.sortOrder)],
    });

    return { success: true, categories: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    return { success: false, error: message, categories: [] };
  }
}

export async function createMenuItem(
  data: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    preparationTime?: number;
    isAvailable?: boolean;
    taxRate?: number;
    cost?: number;
    sku?: string;
    modifiers?: string[];
  }
) {
  try {
    const { restaurant } = await requirePermission("menu:create");
    const parsed = menuItemSchema.parse(data);

    const [item] = await db
      .insert(menuItems)
      .values({
        restaurantId: restaurant.id,
        categoryId: parsed.categoryId,
        name: parsed.name,
        description: parsed.description || null,
        price: parsed.price.toString(),
        preparationTime: parsed.preparationTime || null,
        isAvailable: parsed.isAvailable ?? true,
        taxRate: (parsed.taxRate ?? 0).toString(),
        cost: (parsed.cost ?? 0).toString(),
        sku: parsed.sku || null,
      })
      .returning();

    if (data.modifiers && data.modifiers.length > 0) {
      for (const modifierId of data.modifiers) {
        await db.insert(menuItemModifiers).values({
          menuItemId: item.id,
          modifierId,
        });
      }
    }

    revalidatePath("/menu");
    revalidatePath("/pos");
    return { success: true, item };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create menu item";
    return { success: false, error: message };
  }
}

export async function updateMenuItem(
  itemId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: string;
    preparationTime?: number;
    isAvailable?: boolean;
    taxRate?: number;
    cost?: number;
    sku?: string;
    modifiers?: string[];
  }
) {
  try {
    const { restaurant } = await requirePermission("menu:edit");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price.toString();
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.preparationTime !== undefined) updateData.preparationTime = data.preparationTime;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;
    if (data.taxRate !== undefined) updateData.taxRate = data.taxRate.toString();
    if (data.cost !== undefined) updateData.cost = data.cost.toString();
    if (data.sku !== undefined) updateData.sku = data.sku;

    const [updated] = await db
      .update(menuItems)
      .set(updateData)
      .where(and(eq(menuItems.id, itemId), eq(menuItems.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Menu item not found");

    if (data.modifiers) {
      await db.delete(menuItemModifiers).where(eq(menuItemModifiers.menuItemId, itemId));
      for (const modifierId of data.modifiers) {
        await db.insert(menuItemModifiers).values({ menuItemId: itemId, modifierId });
      }
    }

    revalidatePath("/menu");
    revalidatePath("/pos");
    return { success: true, item: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update menu item";
    return { success: false, error: message };
  }
}

export async function deleteMenuItem(itemId: string) {
  try {
    const { restaurant } = await requirePermission("menu:delete");

    const [deleted] = await db
      .delete(menuItems)
      .where(and(eq(menuItems.id, itemId), eq(menuItems.restaurantId, restaurant.id)))
      .returning();

    if (!deleted) throw new Error("Menu item not found");

    revalidatePath("/menu");
    revalidatePath("/pos");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete menu item";
    return { success: false, error: message };
  }
}

export async function getMenuItems(
  filters?: { categoryId?: string; available?: boolean }
) {
  try {
    const { restaurant } = await requirePermission("menu:view");

    const conditions = [eq(menuItems.restaurantId, restaurant.id)];
    if (filters?.categoryId) {
      conditions.push(eq(menuItems.categoryId, filters.categoryId));
    }
    if (filters?.available !== undefined) {
      conditions.push(eq(menuItems.isAvailable, filters.available));
    }

    const results = await db.query.menuItems.findMany({
      where: and(...conditions),
      with: {
        category: true,
        modifiers: {
          with: {
            modifier: true,
          },
        },
      },
      orderBy: [asc(menuItems.name)],
    });

    return { success: true, items: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch menu items";
    return { success: false, error: message, items: [] };
  }
}

export async function createModifier(data: { name: string; price?: number }) {
  try {
    const { restaurant } = await requirePermission("menu:create");
    const parsed = modifierSchema.parse(data);

    const [modifier] = await db
      .insert(modifiers)
      .values({
        restaurantId: restaurant.id,
        name: parsed.name,
        price: (parsed.price ?? 0).toString(),
      })
      .returning();

    revalidatePath("/menu");
    return { success: true, modifier };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create modifier";
    return { success: false, error: message };
  }
}

export async function updateModifier(modifierId: string, data: { name?: string; price?: number }) {
  try {
    const { restaurant } = await requirePermission("menu:edit");

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = data.price.toString();

    const [updated] = await db
      .update(modifiers)
      .set(updateData)
      .where(and(eq(modifiers.id, modifierId), eq(modifiers.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Modifier not found");

    revalidatePath("/menu");
    return { success: true, modifier: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update modifier";
    return { success: false, error: message };
  }
}

export async function deleteModifier(modifierId: string) {
  try {
    const { restaurant } = await requirePermission("menu:delete");

    const [deleted] = await db
      .delete(modifiers)
      .where(and(eq(modifiers.id, modifierId), eq(modifiers.restaurantId, restaurant.id)))
      .returning();

    if (!deleted) throw new Error("Modifier not found");

    revalidatePath("/menu");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete modifier";
    return { success: false, error: message };
  }
}

export async function getModifiers() {
  try {
    const { restaurant } = await requirePermission("menu:view");

    const results = await db.query.modifiers.findMany({
      where: eq(modifiers.restaurantId, restaurant.id),
    });

    return { success: true, modifiers: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch modifiers";
    return { success: false, error: message, modifiers: [] };
  }
}

export async function createRecipe(
  menuItemId: string,
  items: { ingredientId: string; quantity: number }[]
) {
  try {
    const { restaurant } = await requirePermission("menu:create");

    const existing = await db.query.recipes.findFirst({
      where: and(eq(recipes.menuItemId, menuItemId), eq(recipes.restaurantId, restaurant.id)),
    });

    if (existing) {
      await db.delete(recipeItems).where(eq(recipeItems.recipeId, existing.id));
      await db.delete(recipes).where(and(eq(recipes.id, existing.id), eq(recipes.restaurantId, restaurant.id)));
    }

    const [recipe] = await db
      .insert(recipes)
      .values({
        restaurantId: restaurant.id,
        menuItemId,
      })
      .returning();

    for (const item of items) {
      await db.insert(recipeItems).values({
        recipeId: recipe.id,
        ingredientId: item.ingredientId,
        quantity: item.quantity.toString(),
      });
    }

    revalidatePath("/menu");
    return { success: true, recipe };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create recipe";
    return { success: false, error: message };
  }
}

export async function getRecipes() {
  try {
    const { restaurant } = await requirePermission("menu:view");

    const results = await db.query.recipes.findMany({
      where: eq(recipes.restaurantId, restaurant.id),
      with: {
        menuItem: true,
        items: {
          with: {
            ingredient: true,
          },
        },
      },
    });

    return { success: true, recipes: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch recipes";
    return { success: false, error: message, recipes: [] };
  }
}
