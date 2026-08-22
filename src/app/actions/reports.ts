"use server";

import { requireRestaurant } from "@/lib/auth/server";
import {
  getRevenueReport,
  getSalesReport,
  getProductPerformance,
  getInventoryReport,
  getExpenseReport,
  getCustomerReport,
  parseDateRange,
} from "@/lib/queries/reports";

export async function fetchRevenueReport(from?: string, to?: string) {
  try {
    const { restaurant } = await requireRestaurant();
    const dateRange = parseDateRange(from, to);
    const data = await getRevenueReport(restaurant.id, dateRange);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch revenue report";
    return { success: false, error: message };
  }
}

export async function fetchSalesReport(from?: string, to?: string, branchId?: string) {
  try {
    const { restaurant } = await requireRestaurant();
    const dateRange = parseDateRange(from, to);
    const data = await getSalesReport(restaurant.id, dateRange, branchId);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch sales report";
    return { success: false, error: message };
  }
}

export async function fetchProductPerformance(from?: string, to?: string) {
  try {
    const { restaurant } = await requireRestaurant();
    const dateRange = parseDateRange(from, to);
    const data = await getProductPerformance(restaurant.id, dateRange);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch product performance";
    return { success: false, error: message };
  }
}

export async function fetchInventoryReport() {
  try {
    const { restaurant } = await requireRestaurant();
    const data = await getInventoryReport(restaurant.id);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch inventory report";
    return { success: false, error: message };
  }
}

export async function fetchExpenseReport(from?: string, to?: string) {
  try {
    const { restaurant } = await requireRestaurant();
    const dateRange = parseDateRange(from, to);
    const data = await getExpenseReport(restaurant.id, dateRange);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch expense report";
    return { success: false, error: message };
  }
}

export async function fetchCustomerReport(from?: string, to?: string) {
  try {
    const { restaurant } = await requireRestaurant();
    const dateRange = parseDateRange(from, to);
    const data = await getCustomerReport(restaurant.id, dateRange);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch customer report";
    return { success: false, error: message };
  }
}

export async function fetchBranches() {
  try {
    const { restaurant } = await requireRestaurant();
    const { db } = await import("@/lib/db");
    const { branches } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const data = await db.query.branches.findMany({
      where: eq(branches.restaurantId, restaurant.id),
      orderBy: (branches, { asc }) => [asc(branches.name)],
    });
    return { success: true, branches: data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch branches";
    return { success: false, error: message, branches: [] };
  }
}
