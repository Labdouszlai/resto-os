"use server";

import { requireRestaurant } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { customers, orders, menuItems, employees, suppliers } from "@/lib/db/schema";
import { or, ilike } from "drizzle-orm";

export interface SearchResult {
  type: "customer" | "order" | "menu-item" | "employee" | "supplier";
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export async function searchEntities(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];
  
  try {
    const { restaurant } = await requireRestaurant();
    const results: SearchResult[] = [];
    const pattern = `%${query}%`;
    
    // Search customers
    const custResults = await db.query.customers.findMany({
      where: or(
        ilike(customers.name, pattern),
        ilike(customers.email, pattern),
        ilike(customers.phone, pattern)
      ),
      limit: 5,
    });
    for (const c of custResults) {
      results.push({
        type: "customer",
        id: c.id,
        title: c.name,
        subtitle: c.email || c.phone || "",
        url: `/customers/${c.id}`,
      });
    }
    
    // Search orders
    const orderResults = await db.query.orders.findMany({
      where: ilike(orders.orderNumber, pattern),
      limit: 5,
    });
    for (const o of orderResults) {
      results.push({
        type: "order",
        id: o.id,
        title: o.orderNumber,
        subtitle: `₹${o.total} - ${o.status}`,
        url: `/orders/${o.id}`,
      });
    }
    
    // Search menu items
    const menuResults = await db.query.menuItems.findMany({
      where: ilike(menuItems.name, pattern),
      limit: 5,
    });
    for (const m of menuResults) {
      results.push({
        type: "menu-item",
        id: m.id,
        title: m.name,
        subtitle: `$${m.price}`,
        url: "/menu",
      });
    }
    
    // Search employees
    const empResults = await db.query.employees.findMany({
      where: or(
        ilike(employees.name, pattern),
        ilike(employees.email, pattern)
      ),
      limit: 5,
    });
    for (const e of empResults) {
      results.push({
        type: "employee",
        id: e.id,
        title: e.name,
        subtitle: e.role,
        url: "/employees",
      });
    }
    
    // Search suppliers
    const supResults = await db.query.suppliers.findMany({
      where: or(
        ilike(suppliers.name, pattern),
        ilike(suppliers.company, pattern)
      ),
      limit: 5,
    });
    for (const s of supResults) {
      results.push({
        type: "supplier",
        id: s.id,
        title: s.name,
        subtitle: s.company || "",
        url: "/suppliers",
      });
    }
    
    return results;
  } catch {
    return [];
  }
}
