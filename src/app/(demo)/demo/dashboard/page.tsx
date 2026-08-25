"use client";

import { DollarSign, ShoppingCart, Users, Clock, AlertTriangle, CalendarCheck, TrendingUp } from "lucide-react";

const stats = [
  { title: "Today's Revenue", value: "$4,285.50", icon: DollarSign, change: "+12.5% from yesterday" },
  { title: "Today's Orders", value: "67", icon: ShoppingCart, change: "+8 more than average" },
  { title: "Avg Order Value", value: "$63.96", icon: TrendingUp, change: "per order" },
  { title: "Customers Today", value: "42", icon: Users, change: "+5 new customers" },
];

const secondaryStats = [
  { title: "Open Orders", value: "8", icon: Clock },
  { title: "Pending Reservations", value: "5", icon: CalendarCheck },
  { title: "Low Stock Items", value: "3", icon: AlertTriangle },
];

const revenueData = [
  { day: "Mon", revenue: 3200 },
  { day: "Tue", revenue: 2800 },
  { day: "Wed", revenue: 3500 },
  { day: "Thu", revenue: 4100 },
  { day: "Fri", revenue: 4800 },
  { day: "Sat", revenue: 5200 },
  { day: "Sun", revenue: 4285 },
];

const recentOrders = [
  { id: "ORD-120", time: "2 min ago", items: "Spaghetti Carbonara, Tiramisu", total: "$32.97", status: "pending" },
  { id: "ORD-119", time: "8 min ago", items: "Margherita Pizza, Caesar Salad", total: "$25.98", status: "preparing" },
  { id: "ORD-118", time: "15 min ago", items: "Osso Buco, House Red Wine", total: "$38.98", status: "completed" },
  { id: "ORD-117", time: "22 min ago", items: "Chicken Parmigiana x2", total: "$39.98", status: "completed" },
  { id: "ORD-116", time: "31 min ago", items: "Pepperoni Pizza, Espresso", total: "$21.98", status: "completed" },
  { id: "ORD-115", time: "45 min ago", items: "Fettuccine Alfredo, Sparkling Water", total: "$19.98", status: "completed" },
];

const topItems = [
  { name: "Spaghetti Carbonara", orders: 48, revenue: "$815.52" },
  { name: "Margherita Pizza", orders: 42, revenue: "$629.58" },
  { name: "Chicken Parmigiana", orders: 35, revenue: "$699.65" },
  { name: "Tiramisu", orders: 33, revenue: "$296.67" },
  { name: "Pepperoni Pizza", orders: 30, revenue: "$509.70" },
];

const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export default function DemoDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your restaurant performance</p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">Last 7 days</div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.title} className="border rounded-xl p-4 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{s.title}</span>
              <div className="bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center">
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {secondaryStats.map((s) => (
          <div key={s.title} className="border rounded-xl p-4 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{s.title}</span>
              <s.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border rounded-xl p-5 bg-card">
          <h3 className="font-semibold text-sm mb-4">Revenue This Week</h3>
          <div className="flex items-end gap-2 h-48">
            {revenueData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">${(d.revenue / 1000).toFixed(1)}k</span>
                <div
                  className="w-full bg-primary/20 rounded-t-md relative"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                >
                  <div className="absolute bottom-0 w-full bg-primary rounded-t-md" style={{ height: "100%" }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-xl p-5 bg-card">
          <h3 className="font-semibold text-sm mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{o.id}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[o.status]}`}>
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{o.items}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-semibold">{o.total}</p>
                  <p className="text-[10px] text-muted-foreground">{o.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border rounded-xl p-5 bg-card">
          <h3 className="font-semibold text-sm mb-4">Top Selling Items</h3>
          <div className="space-y-3">
            {topItems.map((item, i) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground w-5">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.orders} orders</p>
                </div>
                <span className="text-sm font-semibold">{item.revenue}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-xl p-5 bg-card">
          <h3 className="font-semibold text-sm mb-4">Order Status</h3>
          <div className="space-y-4">
            {[
              { label: "Completed", count: 52, color: "bg-green-500", pct: 78 },
              { label: "Preparing", count: 8, color: "bg-blue-500", pct: 12 },
              { label: "Pending", count: 5, color: "bg-yellow-500", pct: 7 },
              { label: "Cancelled", count: 2, color: "bg-red-500", pct: 3 },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{s.label}</span>
                  <span className="text-xs text-muted-foreground">{s.count} orders</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
