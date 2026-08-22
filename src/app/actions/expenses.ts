"use server";

import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/server";
import { eq, and, desc, ilike, between } from "drizzle-orm";
import { expenseSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createExpense(data: {
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod?: string;
  description?: string;
  branchId?: string;
}) {
  try {
    const { restaurant } = await requirePermission("expenses:create");
    const parsed = expenseSchema.parse(data);

    const [expense] = await db
      .insert(expenses)
      .values({
        restaurantId: restaurant.id,
        branchId: parsed.branchId || null,
        title: parsed.title,
        category: parsed.category,
        amount: parsed.amount.toString(),
        date: parsed.date,
        paymentMethod: parsed.paymentMethod || "cash",
        description: parsed.description || null,
      })
      .returning();

    revalidatePath("/expenses");
    return { success: true, expense };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create expense";
    return { success: false, error: message };
  }
}

export async function updateExpense(
  expenseId: string,
  data: { title?: string; category?: string; amount?: number; date?: string; paymentMethod?: string; description?: string }
) {
  try {
    const { restaurant } = await requirePermission("expenses:edit");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.amount !== undefined) updateData.amount = data.amount.toString();
    if (data.date !== undefined) updateData.date = data.date;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.description !== undefined) updateData.description = data.description;

    const [updated] = await db
      .update(expenses)
      .set(updateData)
      .where(and(eq(expenses.id, expenseId), eq(expenses.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Expense not found");

    revalidatePath("/expenses");
    return { success: true, expense: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update expense";
    return { success: false, error: message };
  }
}

export async function deleteExpense(expenseId: string) {
  try {
    const { restaurant } = await requirePermission("expenses:delete");

    const [deleted] = await db
      .delete(expenses)
      .where(and(eq(expenses.id, expenseId), eq(expenses.restaurantId, restaurant.id)))
      .returning();

    if (!deleted) throw new Error("Expense not found");

    revalidatePath("/expenses");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete expense";
    return { success: false, error: message };
  }
}

export async function getExpenses(filters?: { category?: string; dateFrom?: string; dateTo?: string; search?: string }) {
  try {
    const { restaurant } = await requirePermission("expenses:view");

    const conditions = [eq(expenses.restaurantId, restaurant.id)];
    if (filters?.category) {
      conditions.push(eq(expenses.category, filters.category));
    }
    if (filters?.dateFrom && filters?.dateTo) {
      conditions.push(between(expenses.date, filters.dateFrom, filters.dateTo));
    }
    if (filters?.search) {
      conditions.push(ilike(expenses.title, `%${filters.search}%`));
    }

    const results = await db.query.expenses.findMany({
      where: and(...conditions),
      orderBy: [desc(expenses.date)],
    });

    return { success: true, expenses: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch expenses";
    return { success: false, error: message, expenses: [] };
  }
}
