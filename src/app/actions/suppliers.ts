"use server";

import { db } from "@/lib/db";
import { suppliers, purchaseOrders } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/server";
import { eq, and, desc } from "drizzle-orm";
import { supplierSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createSupplier(data: {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}) {
  try {
    const { restaurant } = await requirePermission("suppliers:create");
    const parsed = supplierSchema.parse(data);

    const [supplier] = await db
      .insert(suppliers)
      .values({
        restaurantId: restaurant.id,
        name: parsed.name,
        company: parsed.company || null,
        email: parsed.email || null,
        phone: parsed.phone || null,
        address: parsed.address || null,
        notes: parsed.notes || null,
      })
      .returning();

    revalidatePath("/suppliers");
    return { success: true, supplier };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create supplier";
    return { success: false, error: message };
  }
}

export async function updateSupplier(
  supplierId: string,
  data: { name?: string; company?: string; email?: string; phone?: string; address?: string; notes?: string }
) {
  try {
    const { restaurant } = await requirePermission("suppliers:edit");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const [updated] = await db
      .update(suppliers)
      .set(updateData)
      .where(and(eq(suppliers.id, supplierId), eq(suppliers.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Supplier not found");

    revalidatePath("/suppliers");
    return { success: true, supplier: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update supplier";
    return { success: false, error: message };
  }
}

export async function deleteSupplier(supplierId: string) {
  try {
    const { restaurant } = await requirePermission("suppliers:delete");

    const [deleted] = await db
      .delete(suppliers)
      .where(and(eq(suppliers.id, supplierId), eq(suppliers.restaurantId, restaurant.id)))
      .returning();

    if (!deleted) throw new Error("Supplier not found");

    revalidatePath("/suppliers");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete supplier";
    return { success: false, error: message };
  }
}

export async function getSuppliers() {
  try {
    const { restaurant } = await requirePermission("suppliers:view");

    const results = await db.query.suppliers.findMany({
      where: eq(suppliers.restaurantId, restaurant.id),
      orderBy: [suppliers.name],
    });

    return { success: true, suppliers: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch suppliers";
    return { success: false, error: message, suppliers: [] };
  }
}

export async function getSupplier(supplierId: string) {
  try {
    const { restaurant } = await requirePermission("suppliers:view");

    const supplier = await db.query.suppliers.findFirst({
      where: and(eq(suppliers.id, supplierId), eq(suppliers.restaurantId, restaurant.id)),
    });

    if (!supplier) throw new Error("Supplier not found");

    const purchaseHistory = await db.query.purchaseOrders.findMany({
      where: eq(purchaseOrders.supplierId, supplierId),
      orderBy: [desc(purchaseOrders.createdAt)],
      limit: 50,
    });

    return { success: true, supplier, purchaseHistory };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch supplier";
    return { success: false, error: message };
  }
}
