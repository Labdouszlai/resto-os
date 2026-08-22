"use server";

import { db } from "@/lib/db";
import { employees } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/server";
import { eq, and, ilike } from "drizzle-orm";
import { employeeSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createEmployee(data: {
  name: string;
  email?: string;
  phone?: string;
  role: string;
  branchId?: string;
  position?: string;
  status?: string;
  hireDate?: string;
  salary?: number;
}) {
  try {
    const { restaurant } = await requirePermission("employees:create");
    const parsed = employeeSchema.parse(data);

    const [employee] = await db
      .insert(employees)
      .values({
        restaurantId: restaurant.id,
        name: parsed.name,
        email: parsed.email || null,
        phone: parsed.phone || null,
        role: parsed.role,
        branchId: parsed.branchId || null,
        position: parsed.position || null,
        status: parsed.status || "active",
        hireDate: parsed.hireDate || null,
        salary: parsed.salary?.toString() || null,
      })
      .returning();

    revalidatePath("/employees");
    return { success: true, employee };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create employee";
    return { success: false, error: message };
  }
}

export async function updateEmployee(
  employeeId: string,
  data: { name?: string; email?: string; phone?: string; role?: string; branchId?: string; position?: string; status?: string; hireDate?: string; salary?: number }
) {
  try {
    const { restaurant } = await requirePermission("employees:edit");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.branchId !== undefined) updateData.branchId = data.branchId;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.hireDate !== undefined) updateData.hireDate = data.hireDate;
    if (data.salary !== undefined) updateData.salary = data.salary.toString();

    const [updated] = await db
      .update(employees)
      .set(updateData)
      .where(and(eq(employees.id, employeeId), eq(employees.restaurantId, restaurant.id)))
      .returning();

    if (!updated) throw new Error("Employee not found");

    revalidatePath("/employees");
    return { success: true, employee: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update employee";
    return { success: false, error: message };
  }
}

export async function deleteEmployee(employeeId: string) {
  try {
    const { restaurant } = await requirePermission("employees:delete");

    const [deleted] = await db
      .delete(employees)
      .where(and(eq(employees.id, employeeId), eq(employees.restaurantId, restaurant.id)))
      .returning();

    if (!deleted) throw new Error("Employee not found");

    revalidatePath("/employees");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete employee";
    return { success: false, error: message };
  }
}

export async function getEmployees(filters?: { role?: string; status?: string; search?: string }) {
  try {
    const { restaurant } = await requirePermission("employees:view");

    const conditions = [eq(employees.restaurantId, restaurant.id)];
    if (filters?.role) conditions.push(eq(employees.role, filters.role));
    if (filters?.status) conditions.push(eq(employees.status, filters.status));
    if (filters?.search) conditions.push(ilike(employees.name, `%${filters.search}%`));

    const results = await db.query.employees.findMany({
      where: and(...conditions),
      orderBy: [employees.name],
    });

    return { success: true, employees: results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch employees";
    return { success: false, error: message, employees: [] };
  }
}
