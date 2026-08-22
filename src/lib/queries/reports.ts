import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  expenses,
  menuItems,
  menuCategories,
  ingredients,
  customers,
  inventoryMovements,
} from "@/lib/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { startOfDay, endOfDay, subDays, parseISO } from "date-fns";

export interface ReportDateRange {
  start: Date;
  end: Date;
}

export function parseDateRange(from?: string, to?: string): ReportDateRange {
  const now = new Date();
  const start = from ? startOfDay(parseISO(from)) : startOfDay(subDays(now, 29));
  const end = to ? endOfDay(parseISO(to)) : endOfDay(now);
  return { start, end };
}

// =============================================================================
// Revenue Report
// =============================================================================

export async function getRevenueReport(restaurantId: string, dateRange: ReportDateRange) {
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

  const [cogsResult] = await db
    .select({
      total: sql<string>`coalesce(sum(${orderItems.quantity} * ${menuItems.cost}::numeric), 0)`,
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
    );

  const [expensesResult] = await db
    .select({
      total: sql<string>`coalesce(sum(${expenses.amount}::numeric), 0)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.restaurantId, restaurantId),
        gte(expenses.date, sql`${dateRange.start.toISOString().split("T")[0]}`),
        lte(expenses.date, sql`${dateRange.end.toISOString().split("T")[0]}`)
      )
    );

  const revenue = Number(revenueResult?.total || 0);
  const cogs = Number(cogsResult?.total || 0);
  const grossProfit = revenue - cogs;
  const totalExpenses = Number(expensesResult?.total || 0);
  const netProfit = grossProfit - totalExpenses;
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const revenueOverTime = await db
    .select({
      date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      revenue: sql<string>`coalesce(sum(${orders.total}::numeric), 0)`,
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

  return {
    revenue,
    cogs,
    grossProfit,
    expenses: totalExpenses,
    netProfit,
    profitMargin,
    revenueOverTime: revenueOverTime.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
    })),
  };
}

// =============================================================================
// Sales Report
// =============================================================================

export async function getSalesReport(
  restaurantId: string,
  dateRange: ReportDateRange,
  branchId?: string
) {
  const conditions = [
    eq(orders.restaurantId, restaurantId),
    gte(orders.createdAt, dateRange.start),
    lte(orders.createdAt, dateRange.end),
    sql`${orders.status} != 'cancelled'`,
  ];
  if (branchId) {
    conditions.push(eq(orders.branchId, branchId));
  }

  const [totals] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      totalRevenue: sql<string>`coalesce(sum(${orders.total}::numeric), 0)`,
    })
    .from(orders)
    .where(and(...conditions));

  const totalOrders = totals?.totalOrders || 0;
  const totalRevenue = Number(totals?.totalRevenue || 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const ordersByType = await db
    .select({
      type: orders.type,
      count: sql<number>`count(*)::int`,
      revenue: sql<string>`coalesce(sum(${orders.total}::numeric), 0)`,
    })
    .from(orders)
    .where(and(...conditions))
    .groupBy(orders.type);

  const salesByHour = await db
    .select({
      hour: sql<number>`extract(hour from ${orders.createdAt})::int`,
      count: sql<number>`count(*)::int`,
      revenue: sql<string>`coalesce(sum(${orders.total}::numeric), 0)`,
    })
    .from(orders)
    .where(and(...conditions))
    .groupBy(sql`extract(hour from ${orders.createdAt})`)
    .orderBy(sql`extract(hour from ${orders.createdAt})`);

  const hourMap = new Map<number, { count: number; revenue: number }>();
  for (const row of salesByHour) {
    hourMap.set(row.hour, { count: row.count, revenue: Number(row.revenue) });
  }
  const fullHourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: `${i.toString().padStart(2, "0")}:00`,
    count: hourMap.get(i)?.count || 0,
    revenue: hourMap.get(i)?.revenue || 0,
  }));

  return {
    totalOrders,
    totalRevenue,
    avgOrderValue,
    ordersByType: ordersByType.map((r) => ({
      type: r.type,
      count: r.count,
      revenue: Number(r.revenue),
    })),
    salesByHour: fullHourlyData,
  };
}

// =============================================================================
// Product Performance
// =============================================================================

export async function getProductPerformance(restaurantId: string, dateRange: ReportDateRange) {
  const topItems = await db
    .select({
      name: menuItems.name,
      category: menuCategories.name,
      quantity: sql<number>`sum(${orderItems.quantity})::int`,
      revenue: sql<string>`coalesce(sum(${orderItems.subtotal}::numeric), 0)`,
      cost: sql<string>`coalesce(sum(${orderItems.quantity} * ${menuItems.cost}::numeric), 0)`,
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
    .groupBy(menuItems.id, menuItems.name, menuCategories.name)
    .orderBy(desc(sql`sum(${orderItems.quantity})`));

  const categoryPerformance = await db
    .select({
      category: menuCategories.name,
      quantity: sql<number>`sum(${orderItems.quantity})::int`,
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
    .orderBy(desc(sql`sum(${orderItems.subtotal}::numeric)`));

  const enrichedTop = topItems.map((r) => {
    const rev = Number(r.revenue);
    const cost = Number(r.cost);
    return {
      name: r.name,
      category: r.category,
      quantity: r.quantity,
      revenue: rev,
      profit: rev - cost,
    };
  });

  return {
    topItems: enrichedTop,
    bottomItems: [...enrichedTop].reverse().slice(0, 10),
    categoryPerformance: categoryPerformance.map((r) => ({
      category: r.category,
      quantity: r.quantity,
      revenue: Number(r.revenue),
    })),
  };
}

// =============================================================================
// Inventory Report
// =============================================================================

export async function getInventoryReport(restaurantId: string) {
  const allIngredients = await db
    .select({
      id: ingredients.id,
      name: ingredients.name,
      sku: ingredients.sku,
      unit: ingredients.unit,
      currentStock: ingredients.currentStock,
      minimumStock: ingredients.minimumStock,
      costPerUnit: ingredients.costPerUnit,
      supplierId: ingredients.supplierId,
    })
    .from(ingredients)
    .where(eq(ingredients.restaurantId, restaurantId))
    .orderBy(ingredients.name);

  const lowStock = allIngredients.filter((i) => {
    const current = Number(i.currentStock);
    const min = Number(i.minimumStock);
    return min > 0 && current <= min;
  });

  const totalValue = allIngredients.reduce(
    (sum, i) => sum + Number(i.currentStock) * Number(i.costPerUnit),
    0
  );

  const recentMovements = await db
    .select({
      id: inventoryMovements.id,
      type: inventoryMovements.type,
      quantity: inventoryMovements.quantity,
      notes: inventoryMovements.notes,
      createdAt: inventoryMovements.createdAt,
      ingredientName: ingredients.name,
      ingredientUnit: ingredients.unit,
    })
    .from(inventoryMovements)
    .innerJoin(ingredients, eq(inventoryMovements.ingredientId, ingredients.id))
    .where(eq(inventoryMovements.restaurantId, restaurantId))
    .orderBy(desc(inventoryMovements.createdAt))
    .limit(50);

  const totalIn = recentMovements
    .filter((m) => m.type === "addition")
    .reduce((sum, m) => sum + Number(m.quantity), 0);

  const totalOut = recentMovements
    .filter((m) => m.type === "deduction")
    .reduce((sum, m) => sum + Number(m.quantity), 0);

  return {
    totalItems: allIngredients.length,
    lowStockCount: lowStock.length,
    lowStockItems: lowStock.map((i) => ({
      id: i.id,
      name: i.name,
      sku: i.sku,
      unit: i.unit,
      currentStock: Number(i.currentStock),
      minimumStock: Number(i.minimumStock),
    })),
    totalValue,
    stockLevels: allIngredients.map((i) => ({
      id: i.id,
      name: i.name,
      sku: i.sku,
      unit: i.unit,
      currentStock: Number(i.currentStock),
      minimumStock: Number(i.minimumStock),
      costPerUnit: Number(i.costPerUnit),
      value: Number(i.currentStock) * Number(i.costPerUnit),
    })),
    movementsSummary: {
      totalMovements: recentMovements.length,
      totalIn,
      totalOut,
    },
  };
}

// =============================================================================
// Expense Report
// =============================================================================

export async function getExpenseReport(restaurantId: string, dateRange: ReportDateRange) {
  const dateFrom = dateRange.start.toISOString().split("T")[0];
  const dateTo = dateRange.end.toISOString().split("T")[0];

  const [totalResult] = await db
    .select({
      total: sql<string>`coalesce(sum(${expenses.amount}::numeric), 0)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.restaurantId, restaurantId),
        gte(expenses.date, dateFrom),
        lte(expenses.date, dateTo)
      )
    );

  const byCategory = await db
    .select({
      category: expenses.category,
      total: sql<string>`coalesce(sum(${expenses.amount}::numeric), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.restaurantId, restaurantId),
        gte(expenses.date, dateFrom),
        lte(expenses.date, dateTo)
      )
    )
    .groupBy(expenses.category)
    .orderBy(desc(sql`coalesce(sum(${expenses.amount}::numeric), 0)`));

  const trend = await db
    .select({
      date: sql<string>`to_char(${expenses.date}::date, 'YYYY-MM-DD')`,
      total: sql<string>`coalesce(sum(${expenses.amount}::numeric), 0)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.restaurantId, restaurantId),
        gte(expenses.date, dateFrom),
        lte(expenses.date, dateTo)
      )
    )
    .groupBy(sql`to_char(${expenses.date}::date, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${expenses.date}::date, 'YYYY-MM-DD')`);

  return {
    totalExpenses: Number(totalResult?.total || 0),
    byCategory: byCategory.map((r) => ({
      category: r.category,
      total: Number(r.total),
      count: r.count,
    })),
    trend: trend.map((r) => ({
      date: r.date,
      total: Number(r.total),
    })),
  };
}

// =============================================================================
// Customer Report
// =============================================================================

export async function getCustomerReport(restaurantId: string, dateRange: ReportDateRange) {
  const [totalResult] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(customers)
    .where(eq(customers.restaurantId, restaurantId));

  const dateFrom = dateRange.start.toISOString().split("T")[0];
  const dateTo = dateRange.end.toISOString().split("T")[0];

  const [newResult] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(customers)
    .where(
      and(
        eq(customers.restaurantId, restaurantId),
        gte(customers.createdAt, dateRange.start),
        lte(customers.createdAt, dateRange.end)
      )
    );

  const topCustomers = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      orderCount: sql<number>`count(${orders.id})::int`,
      totalSpent: sql<string>`coalesce(sum(${orders.total}::numeric), 0)`,
    })
    .from(customers)
    .leftJoin(
      orders,
      and(
        eq(orders.customerId, customers.id),
        eq(orders.restaurantId, restaurantId),
        gte(orders.createdAt, dateRange.start),
        lte(orders.createdAt, dateRange.end),
        sql`${orders.status} != 'cancelled'`
      )
    )
    .where(eq(customers.restaurantId, restaurantId))
    .groupBy(customers.id, customers.name, customers.email)
    .orderBy(desc(sql`coalesce(sum(${orders.total}::numeric), 0)`))
    .limit(20);

  const [avgResult] = await db
    .select({
      avg: sql<string>`coalesce(avg(${orders.total}::numeric), 0)`,
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

  return {
    totalCustomers: totalResult?.count || 0,
    newCustomers: newResult?.count || 0,
    avgCustomerValue: Number(avgResult?.avg || 0),
    topCustomers: topCustomers.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      orderCount: r.orderCount,
      totalSpent: Number(r.totalSpent),
    })),
  };
}
