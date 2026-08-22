import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  payments,
  menuItems,
  menuCategories,
  ingredients,
  reservations,
} from "@/lib/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from "date-fns";

export interface DateRange {
  start: Date;
  end: Date;
}

function getDefaultDateRange(): DateRange {
  const now = new Date();
  return {
    start: startOfDay(subDays(now, 6)),
    end: endOfDay(now),
  };
}

function getDateRange(filter: string): DateRange {
  const now = new Date();
  switch (filter) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "yesterday":
      return { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) };
    case "last-7-days":
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    case "last-30-days":
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
    case "this-month":
      return { start: startOfMonth(now), end: endOfDay(now) };
    case "last-month": {
      const lastMonth = subDays(startOfMonth(now), 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    default:
      return getDefaultDateRange();
  }
}

export async function getDashboardStats(restaurantId: string, dateFilter: string = "last-7-days") {
  const dateRange = getDateRange(dateFilter);
  const todayRange = { start: startOfDay(new Date()), end: endOfDay(new Date()) };

  const [revenueResult] = await db
    .select({
      total: sql<string>`coalesce(sum(${orders.total}::numeric), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, dateRange.start),
        lte(orders.createdAt, dateRange.end),
        sql`${orders.status} != 'cancelled'`
      )
    );

  const [todayRevenue] = await db
    .select({
      total: sql<string>`coalesce(sum(${orders.total}::numeric), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, todayRange.start),
        lte(orders.createdAt, todayRange.end),
        sql`${orders.status} != 'cancelled'`
      )
    );

  const [todayOrdersCount] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, todayRange.start),
        lte(orders.createdAt, todayRange.end)
      )
    );

  const [totalOrdersCount] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, dateRange.start),
        lte(orders.createdAt, dateRange.end)
      )
    );

  const totalOrders = totalOrdersCount?.count || 0;
  const totalRevenue = Number(revenueResult?.total || 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const [customersToday] = await db
    .select({
      count: sql<number>`count(distinct ${orders.customerId})::int`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, todayRange.start),
        lte(orders.createdAt, todayRange.end),
        sql`${orders.customerId} IS NOT NULL`
      )
    );

  const [openOrders] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        sql`${orders.status} IN ('draft', 'pending', 'confirmed', 'preparing', 'ready')`
      )
    );

  const todayStr = todayRange.start.toISOString().split("T")[0];
  const [pendingReservations] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(reservations)
    .where(
      and(
        eq(reservations.restaurantId, restaurantId),
        eq(reservations.date, todayStr),
        sql`${reservations.status} IN ('pending', 'confirmed')`
      )
    );

  const [lowStockItems] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(ingredients)
    .where(
      and(
        eq(ingredients.restaurantId, restaurantId),
        sql`${ingredients.currentStock} <= ${ingredients.minimumStock}`
      )
    );

  return {
    todayRevenue: Number(todayRevenue?.total || 0),
    totalRevenue,
    todayOrders: todayOrdersCount?.count || 0,
    avgOrderValue,
    customersToday: customersToday?.count || 0,
    openOrders: openOrders?.count || 0,
    pendingReservations: pendingReservations?.count || 0,
    lowStockItems: lowStockItems?.count || 0,
  };
}

export async function getRevenueOverTime(restaurantId: string, dateFilter: string = "last-7-days") {
  const dateRange = getDateRange(dateFilter);

  const results = await db
    .select({
      date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      revenue: sql<string>`coalesce(sum(${orders.total}::numeric), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, dateRange.start),
        lte(orders.createdAt, dateRange.end),
        sql`${orders.status} != 'cancelled'`
      )
    )
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

  return results.map((r) => ({
    date: r.date,
    revenue: Number(r.revenue),
    orders: r.count,
  }));
}

export async function getOrdersOverTime(restaurantId: string, dateFilter: string = "last-7-days") {
  const dateRange = getDateRange(dateFilter);

  const results = await db
    .select({
      date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, dateRange.start),
        lte(orders.createdAt, dateRange.end)
      )
    )
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

  return results.map((r) => ({
    date: r.date,
    orders: r.count,
  }));
}

export async function getRevenueByCategory(restaurantId: string, dateFilter: string = "last-7-days") {
  const dateRange = getDateRange(dateFilter);

  const results = await db
    .select({
      category: menuCategories.name,
      revenue: sql<string>`coalesce(sum(${orderItems.subtotal}::numeric), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, dateRange.start),
        lte(orders.createdAt, dateRange.end),
        sql`${orders.status} != 'cancelled'`
      )
    )
    .groupBy(menuCategories.name)
    .orderBy(desc(sql`coalesce(sum(${orderItems.subtotal}::numeric), 0)`));

  return results.map((r) => ({
    category: r.category,
    revenue: Number(r.revenue),
  }));
}

export async function getTopSellingItems(restaurantId: string, dateFilter: string = "last-7-days") {
  const dateRange = getDateRange(dateFilter);

  const results = await db
    .select({
      name: menuItems.name,
      quantity: sql<number>`sum(${orderItems.quantity})::int`,
      revenue: sql<string>`coalesce(sum(${orderItems.subtotal}::numeric), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, dateRange.start),
        lte(orders.createdAt, dateRange.end),
        sql`${orders.status} != 'cancelled'`
      )
    )
    .groupBy(menuItems.name)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(10);

  return results.map((r) => ({
    name: r.name,
    quantity: r.quantity,
    revenue: Number(r.revenue),
  }));
}

export async function getPaymentMethodsDistribution(restaurantId: string, dateFilter: string = "last-7-days") {
  const dateRange = getDateRange(dateFilter);

  const results = await db
    .select({
      method: payments.method,
      count: sql<number>`count(*)::int`,
      total: sql<string>`coalesce(sum(${payments.amount}::numeric), 0)`,
    })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .where(
      and(
        eq(payments.restaurantId, restaurantId),
        gte(payments.createdAt, dateRange.start),
        lte(payments.createdAt, dateRange.end),
        sql`${payments.status} = 'completed'`
      )
    )
    .groupBy(payments.method);

  return results.map((r) => ({
    method: r.method,
    count: r.count,
    total: Number(r.total),
  }));
}

export async function getOrderStatusDistribution(restaurantId: string, dateFilter: string = "last-7-days") {
  const dateRange = getDateRange(dateFilter);

  const results = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, dateRange.start),
        lte(orders.createdAt, dateRange.end)
      )
    )
    .groupBy(orders.status);

  return results.map((r) => ({
    status: r.status,
    count: r.count,
  }));
}

export async function getLowStockItems(restaurantId: string) {
  const results = await db
    .select({
      id: ingredients.id,
      name: ingredients.name,
      sku: ingredients.sku,
      currentStock: ingredients.currentStock,
      minimumStock: ingredients.minimumStock,
      unit: ingredients.unit,
    })
    .from(ingredients)
    .where(
      and(
        eq(ingredients.restaurantId, restaurantId),
        sql`${ingredients.currentStock} <= ${ingredients.minimumStock}`
      )
    )
    .orderBy(ingredients.name);

  return results;
}
