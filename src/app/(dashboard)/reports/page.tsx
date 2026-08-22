"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchRevenueReport,
  fetchSalesReport,
  fetchProductPerformance,
  fetchInventoryReport,
  fetchExpenseReport,
  fetchCustomerReport,
  fetchBranches,
} from "@/app/actions/reports";
import type { Branch } from "@/lib/db/schema";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Users,
  Receipt,
  BarChart3,
  ArrowUpDown,
  Loader2,
  AlertTriangle,
  Calendar,
} from "lucide-react";

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

function getDefaultDateRange() {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  const from = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  return { from, to };
}

function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="size-4 text-muted-foreground" />
      <Input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="w-36"
      />
      <span className="text-muted-foreground">to</span>
      <Input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="w-36"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && trendValue && (
              <p className={`text-xs mt-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend === "up" ? "↑" : "↓"} {trendValue}
              </p>
            )}
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Revenue Report Tab
// =============================================================================

function RevenueReportTab({ from, to }: { from: string; to: string }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchRevenueReport>>["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await fetchRevenueReport(from, to);
    if (result.success) {
      setData(result.data);
    } else {
      toast.error(result.error || "Failed to load revenue report");
    }
    setLoading(false);
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading revenue report...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Revenue" value={formatCurrency(data.revenue)} icon={<DollarSign className="size-5" />} />
        <StatCard title="Cost of Goods Sold" value={formatCurrency(data.cogs)} icon={<Package className="size-5" />} />
        <StatCard title="Gross Profit" value={formatCurrency(data.grossProfit)} icon={<TrendingUp className="size-5" />} />
        <StatCard title="Total Expenses" value={formatCurrency(data.expenses)} icon={<Receipt className="size-5" />} />
        <StatCard
          title="Net Profit"
          value={formatCurrency(data.netProfit)}
          icon={data.netProfit >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
          trend={data.netProfit >= 0 ? "up" : "down"}
        />
        <StatCard
          title="Profit Margin"
          value={`${data.profitMargin.toFixed(1)}%`}
          icon={<BarChart3 className="size-5" />}
          trend={data.profitMargin >= 0 ? "up" : "down"}
        />
      </div>

      {data.revenueOverTime.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =============================================================================
// Sales Report Tab
// =============================================================================

function SalesReportTab({ from, to, branchId }: { from: string; to: string; branchId?: string }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchSalesReport>>["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await fetchSalesReport(from, to, branchId);
    if (result.success) {
      setData(result.data);
    } else {
      toast.error(result.error || "Failed to load sales report");
    }
    setLoading(false);
  }, [from, to, branchId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading sales report...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Orders" value={formatNumber(data.totalOrders)} icon={<ShoppingCart className="size-5" />} />
        <StatCard title="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={<DollarSign className="size-5" />} />
        <StatCard title="Avg Order Value" value={formatCurrency(data.avgOrderValue)} icon={<BarChart3 className="size-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Orders by Type</h3>
            {data.ordersByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.ordersByType}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="type"
                    label={(props) => { const { type, count } = props as unknown as { type: string; count: number }; return `${type}: ${count}`; }}
                  >
                    {data.ordersByType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No order data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue by Type</h3>
            {data.ordersByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.ordersByType}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="type" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No revenue data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Sales by Hour of Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.salesByHour}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" className="text-xs" tick={{ fontSize: 10 }} interval={2} />
              <YAxis className="text-xs" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value, name) => [name === "revenue" ? formatCurrency(Number(value)) : value, name === "revenue" ? "Revenue" : "Orders"]} />
              <Legend />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Orders" />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// Product Performance Tab
// =============================================================================

function ProductPerformanceTab({ from, to }: { from: string; to: string }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchProductPerformance>>["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await fetchProductPerformance(from, to);
    if (result.success) {
      setData(result.data);
    } else {
      toast.error(result.error || "Failed to load product performance");
    }
    setLoading(false);
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading product performance...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Selling Items</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topItems.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" className="text-xs" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Category Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="category" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Items Detail</h3>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Qty Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="py-8 text-center text-muted-foreground">No sales data available</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                      <TableCell className="text-right">
                        <span className={item.profit >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(item.profit)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {data.bottomItems.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Bottom Performing Items</h3>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Qty Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.bottomItems.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =============================================================================
// Inventory Report Tab
// =============================================================================

function InventoryReportTab() {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchInventoryReport>>["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await fetchInventoryReport();
    if (result.success) {
      setData(result.data);
    } else {
      toast.error(result.error || "Failed to load inventory report");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading inventory report...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Items" value={formatNumber(data.totalItems)} icon={<Package className="size-5" />} />
        <StatCard title="Inventory Value" value={formatCurrency(data.totalValue)} icon={<DollarSign className="size-5" />} />
        <StatCard title="Low Stock Items" value={formatNumber(data.lowStockCount)} icon={<AlertTriangle className="size-5" />} />
        <StatCard title="Recent Movements" value={formatNumber(data.movementsSummary.totalMovements)} icon={<ArrowUpDown className="size-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Stock Overview</h3>
            {data.stockLevels.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.stockLevels.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value, name) => [name === "value" ? formatCurrency(Number(value)) : value, name === "value" ? "Value" : "Stock"]} />
                  <Legend />
                  <Bar dataKey="currentStock" fill="#3b82f6" name="Current Stock" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="minimumStock" fill="#f59e0b" name="Min Stock" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No inventory data available</p>
            )}
          </CardContent>
        </Card>

        {data.lowStockItems.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Low Stock Alerts</h3>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Minimum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.lowStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">{item.currentStock} {item.unit}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{item.minimumStock} {item.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Expense Report Tab
// =============================================================================

function ExpenseReportTab({ from, to }: { from: string; to: string }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchExpenseReport>>["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await fetchExpenseReport(from, to);
    if (result.success) {
      setData(result.data);
    } else {
      toast.error(result.error || "Failed to load expense report");
    }
    setLoading(false);
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading expense report...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Total Expenses" value={formatCurrency(data.totalExpenses)} icon={<Receipt className="size-5" />} />
        <StatCard title="Categories" value={formatNumber(data.byCategory.length)} icon={<BarChart3 className="size-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Expenses by Category</h3>
            {data.byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.byCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="total"
                    nameKey="category"
                    label={(props) => { const { category, total } = props as unknown as { category: string; total: number }; return `${category}: ${formatCurrency(total)}`; }}
                  >
                    {data.byCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No expense data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Expense Trend</h3>
            {data.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Expenses"]} />
                  <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No trend data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Category Breakdown</h3>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.byCategory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="py-8 text-center text-muted-foreground">No expense data available</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.byCategory.map((cat) => (
                    <TableRow key={cat.category}>
                      <TableCell className="font-medium">{cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}</TableCell>
                      <TableCell className="text-right">{cat.count}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(cat.total)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {data.totalExpenses > 0 ? ((cat.total / data.totalExpenses) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// Customer Report Tab
// =============================================================================

function CustomerReportTab({ from, to }: { from: string; to: string }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchCustomerReport>>["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await fetchCustomerReport(from, to);
    if (result.success) {
      setData(result.data);
    } else {
      toast.error(result.error || "Failed to load customer report");
    }
    setLoading(false);
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Loading customer report...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Customers" value={formatNumber(data.totalCustomers)} icon={<Users className="size-5" />} />
        <StatCard title="New Customers" value={formatNumber(data.newCustomers)} icon={<TrendingUp className="size-5" />} />
        <StatCard title="Avg Customer Value" value={formatCurrency(data.avgCustomerValue)} icon={<DollarSign className="size-5" />} />
      </div>

      <Card>
        <CardContent className="pt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Customers by Spending</h3>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="py-8 text-center text-muted-foreground">No customer data available</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="text-muted-foreground">{customer.email || "—"}</TableCell>
                      <TableCell className="text-right">{customer.orderCount}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(customer.totalSpent)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// Main Reports Page
// =============================================================================

export default function ReportsPage() {
  const defaultRange = getDefaultDateRange();
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [activeTab, setActiveTab] = useState("revenue");
  const [branchFilter, setBranchFilter] = useState("all");
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    fetchBranches().then((result) => {
      if (result.success && result.branches) {
        setBranches(result.branches);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive analytics and insights for your restaurant
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab !== "inventory" && (
            <DateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
          )}
          {activeTab === "sales" && branches.length > 0 && (
            <Select value={branchFilter} onValueChange={(v) => setBranchFilter(v ?? "")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Tabs defaultValue="revenue" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="revenue">
            <DollarSign className="mr-1.5 size-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="sales">
            <ShoppingCart className="mr-1.5 size-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="mr-1.5 size-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <ArrowUpDown className="mr-1.5 size-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <Receipt className="mr-1.5 size-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="mr-1.5 size-4" />
            Customers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <RevenueReportTab from={from} to={to} />
        </TabsContent>

        <TabsContent value="sales">
          <SalesReportTab
            from={from}
            to={to}
            branchId={branchFilter !== "all" ? branchFilter : undefined}
          />
        </TabsContent>

        <TabsContent value="products">
          <ProductPerformanceTab from={from} to={to} />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryReportTab />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseReportTab from={from} to={to} />
        </TabsContent>

        <TabsContent value="customers">
          <CustomerReportTab from={from} to={to} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
