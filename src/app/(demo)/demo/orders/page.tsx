"use client";

import { useState } from "react";

const orders = [
  { id: "ORD-120", time: "10:32 AM", customer: "Alice Johnson", items: 3, total: "$32.97", status: "pending", type: "Dine-in", table: "T4" },
  { id: "ORD-119", time: "10:24 AM", customer: "Bob Smith", items: 2, total: "$25.98", status: "preparing", type: "Dine-in", table: "T7" },
  { id: "ORD-118", time: "10:17 AM", customer: "Carol White", items: 4, total: "$56.96", status: "completed", type: "Takeout", table: "-" },
  { id: "ORD-117", time: "10:10 AM", customer: "David Brown", items: 2, total: "$39.98", status: "completed", type: "Dine-in", table: "T2" },
  { id: "ORD-116", time: "9:58 AM", customer: "Emma Davis", items: 2, total: "$21.98", status: "completed", type: "Delivery", table: "-" },
  { id: "ORD-115", time: "9:45 AM", customer: "Frank Miller", items: 2, total: "$19.98", status: "completed", type: "Dine-in", table: "T11" },
  { id: "ORD-114", time: "9:30 AM", customer: "Grace Wilson", items: 5, total: "$67.95", status: "completed", type: "Dine-in", table: "T1" },
  { id: "ORD-113", time: "9:22 AM", customer: "Henry Moore", items: 1, total: "$16.99", status: "cancelled", type: "Takeout", table: "-" },
  { id: "ORD-112", time: "Yesterday", customer: "Ivy Taylor", items: 3, total: "$42.97", status: "completed", type: "Dine-in", table: "T5" },
  { id: "ORD-111", time: "Yesterday", customer: "Jack Anderson", items: 2, total: "$28.98", status: "completed", type: "Delivery", table: "-" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statuses = ["all", "pending", "preparing", "completed", "cancelled"];

export default function DemoOrdersPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and track all orders</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Order</th>
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Items</th>
              <th className="text-left p-3 font-medium">Total</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium">{o.id}</td>
                <td className="p-3">{o.customer}</td>
                <td className="p-3">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">{o.type}</span>
                </td>
                <td className="p-3 text-muted-foreground">{o.items} items{o.table !== "-" ? ` · ${o.table}` : ""}</td>
                <td className="p-3 font-medium">{o.total}</td>
                <td className="p-3">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground text-xs">{o.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground text-center">Demo mode — showing sample data</p>
    </div>
  );
}
