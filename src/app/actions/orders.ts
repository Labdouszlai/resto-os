"use server";

import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  orderItemModifiers,
  menuItems,
  recipes,
  recipeItems,
  ingredients,
  inventoryMovements,
  payments,
  tables,
  notifications,
  modifiers,
} from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth/server";
import { eq, and, desc, sql, ilike, between, count } from "drizzle-orm";
import { orderSchema, orderItemSchema, paymentSchema } from "@/lib/validations";
import { generateOrderNumber, toNumber } from "@/lib/format";
import { revalidatePath } from "next/cache";

export async function createOrder(data: {
  type: string;
  tableId?: string;
  customerId?: string;
  branchId?: string;
  notes?: string;
  items: {
    menuItemId: string;
    quantity: number;
    price: number;
    notes?: string;
    modifiers?: string[];
  }[];
}) {
  try {
    const { restaurant, member } = await requirePermission("orders:create");

    const branchId = data.branchId || member.branchId;
    if (!branchId) throw new Error("Branch is required");

    const subtotal = data.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const taxRate = toNumber(restaurant.taxRate);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const [order] = await db
      .insert(orders)
      .values({
        restaurantId: restaurant.id,
        branchId,
        tableId: data.tableId || null,
        customerId: data.customerId || null,
        orderNumber: generateOrderNumber(),
        type: data.type,
        status: "pending",
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        discount: "0",
        total: total.toString(),
        notes: data.notes || null,
      })
      .returning();

    for (const item of data.items) {
      const [orderItem] = await db
        .insert(orderItems)
        .values({
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price.toString(),
          subtotal: (item.price * item.quantity).toString(),
          notes: item.notes || null,
        })
        .returning();

      if (item.modifiers && item.modifiers.length > 0) {
        for (const modifierId of item.modifiers) {
          const modifier = await db.query.modifiers.findFirst({
            where: eq(modifiers.id, modifierId),
          });
          if (modifier) {
            await db.insert(orderItemModifiers).values({
              orderItemId: orderItem.id,
              modifierId,
              price: modifier.price,
            });
          }
        }
      }
    }

    if (data.tableId) {
      await db
        .update(tables)
        .set({ status: "occupied", updatedAt: new Date() })
        .where(eq(tables.id, data.tableId));
    }

    revalidatePath("/orders");
    revalidatePath("/pos");
    return { success: true, order };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    return { success: false, error: message };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string
) {
  try {
    const { restaurant } = await requirePermission("orders:edit");

    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(
        and(eq(orders.id, orderId), eq(orders.restaurantId, restaurant.id))
      )
      .returning();

    if (!updated) throw new Error("Order not found");

    await db.insert(notifications).values({
      restaurantId: restaurant.id,
      title: `Order ${updated.orderNumber} status updated`,
      message: `Order status changed to ${status}`,
      type: "order_status",
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true, order: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update order status";
    return { success: false, error: message };
  }
}

export async function cancelOrder(orderId: string) {
  try {
    const { restaurant } = await requirePermission("orders:cancel");

    const [updated] = await db
      .update(orders)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(
        and(eq(orders.id, orderId), eq(orders.restaurantId, restaurant.id))
      )
      .returning();

    if (!updated) throw new Error("Order not found");

    if (updated.tableId) {
      await db
        .update(tables)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(tables.id, updated.tableId));
    }

    await db.insert(notifications).values({
      restaurantId: restaurant.id,
      title: `Order ${updated.orderNumber} cancelled`,
      message: "Order has been cancelled",
      type: "order_cancelled",
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel order";
    return { success: false, error: message };
  }
}

export async function getOrders(
  filters?: {
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
) {
  try {
    const { restaurant } = await requirePermission("orders:view");

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(orders.restaurantId, restaurant.id)];

    if (filters?.status && filters.status !== "all") {
      conditions.push(eq(orders.status, filters.status));
    }
    if (filters?.type) {
      conditions.push(eq(orders.type, filters.type));
    }
    if (filters?.dateFrom && filters?.dateTo) {
      conditions.push(
        between(orders.createdAt, new Date(filters.dateFrom), new Date(filters.dateTo))
      );
    }
    if (filters?.search) {
      conditions.push(
        ilike(orders.orderNumber, `%${filters.search}%`)
      );
    }

    const where = and(...conditions);

    const [total] = await db
      .select({ value: count() })
      .from(orders)
      .where(where);

    const results = await db.query.orders.findMany({
      where,
      orderBy: [desc(orders.createdAt)],
      limit,
      offset,
      with: {
        items: {
          with: {
            modifiers: true,
          },
        },
        table: true,
        customer: true,
      },
    });

    return {
      success: true,
      orders: results,
      pagination: {
        total: total.value,
        page,
        limit,
        totalPages: Math.ceil(total.value / limit),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    return { success: false, error: message, orders: [], pagination: null };
  }
}

export async function getOrder(orderId: string) {
  try {
    const { restaurant } = await requirePermission("orders:view");

    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, orderId),
        eq(orders.restaurantId, restaurant.id)
      ),
      with: {
        items: {
          with: {
            modifiers: {
              with: {
                modifier: true,
              },
            },
          },
        },
        table: true,
        customer: true,
        payments: true,
      },
    });

    if (!order) throw new Error("Order not found");

    return { success: true, order };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch order";
    return { success: false, error: message };
  }
}

export async function completeOrder(orderId: string) {
  try {
    const { restaurant } = await requirePermission("orders:edit");

    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, orderId),
        eq(orders.restaurantId, restaurant.id)
      ),
      with: {
        items: true,
      },
    }) as (typeof orders.$inferSelect & { items: Array<typeof orderItems.$inferSelect> }) | undefined;

    if (!order) throw new Error("Order not found");

    for (const item of order.items) {
      const recipe = await db.query.recipes.findFirst({
        where: eq(recipes.menuItemId, item.menuItemId),
        with: {
          items: true,
        },
      }) as (typeof recipes.$inferSelect & { items: Array<typeof recipeItems.$inferSelect> }) | undefined;

      if (recipe) {
        for (const recipeItem of recipe.items) {
          const ingredient = await db.query.ingredients.findFirst({
            where: eq(ingredients.id, recipeItem.ingredientId),
          });

          if (ingredient) {
            const usedQty = toNumber(recipeItem.quantity) * item.quantity;
            const newStock = toNumber(ingredient.currentStock) - usedQty;

            await db
              .update(ingredients)
              .set({
                currentStock: Math.max(0, newStock).toString(),
                updatedAt: new Date(),
              })
              .where(eq(ingredients.id, recipeItem.ingredientId));

            await db.insert(inventoryMovements).values({
              restaurantId: restaurant.id,
              ingredientId: recipeItem.ingredientId,
              type: "deduction",
              quantity: usedQty.toString(),
              referenceId: orderId,
              notes: `Order ${order.orderNumber} - ${item.quantity}x`,
            });
          }
        }
      }
    }

    if (order.tableId) {
      await db
        .update(tables)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(tables.id, order.tableId));
    }

    await db
      .update(orders)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    await db.insert(notifications).values({
      restaurantId: restaurant.id,
      title: `Order ${order.orderNumber} completed`,
      message: "Order has been completed and inventory updated",
      type: "order_completed",
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/pos");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete order";
    return { success: false, error: message };
  }
}

export async function payOrder(
  orderId: string,
  paymentData: {
    amount: number;
    method: string;
    reference?: string;
  }
) {
  try {
    const { restaurant } = await requirePermission("payments:create");

    const parsed = paymentSchema.parse(paymentData);

    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, orderId),
        eq(orders.restaurantId, restaurant.id)
      ),
    });

    if (!order) throw new Error("Order not found");

    const [payment] = await db
      .insert(payments)
      .values({
        restaurantId: restaurant.id,
        orderId,
        amount: parsed.amount.toString(),
        method: parsed.method,
        status: "completed",
        reference: parsed.reference || null,
      })
      .returning();

    await db.insert(notifications).values({
      restaurantId: restaurant.id,
      title: `Payment received for ${order.orderNumber}`,
      message: `${parsed.method} payment of ${parsed.amount} received`,
      type: "payment_received",
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true, payment };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process payment";
    return { success: false, error: message };
  }
}
