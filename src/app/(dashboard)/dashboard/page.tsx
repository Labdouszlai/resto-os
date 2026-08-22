import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DollarSign, ShoppingCart, Users, Clock, AlertTriangle, CalendarCheck, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { OrdersChart } from "@/components/dashboard/orders-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { TopItemsChart } from "@/components/dashboard/top-items-chart";
import { PaymentChart } from "@/components/dashboard/payment-chart";
import { StatusChart } from "@/components/dashboard/status-chart";
import { DateFilter } from "./date-filter";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  getDashboardStats,
  getRevenueOverTime,
  getOrdersOverTime,
  getRevenueByCategory,
  getTopSellingItems,
  getPaymentMethodsDistribution,
  getOrderStatusDistribution,
} from "@/lib/queries/dashboard";
import { requireAuth, getActiveRestaurant } from "@/lib/auth/server";

async function DashboardContent({ dateFilter }: { dateFilter: string }) {
  let restaurantId: string;
  try {
    const session = await requireAuth();
    const active = await getActiveRestaurant(session.user.id);
    if (!active?.restaurant) {
      redirect("/sign-in");
    }
    restaurantId = active.restaurant.id;
  } catch {
    redirect("/sign-in");
  }

  const [
    stats,
    revenueData,
    ordersData,
    categoryData,
    topItems,
    paymentData,
    statusData,
  ] = await Promise.all([
    getDashboardStats(restaurantId, dateFilter),
    getRevenueOverTime(restaurantId, dateFilter),
    getOrdersOverTime(restaurantId, dateFilter),
    getRevenueByCategory(restaurantId, dateFilter),
    getTopSellingItems(restaurantId, dateFilter),
    getPaymentMethodsDistribution(restaurantId, dateFilter),
    getOrderStatusDistribution(restaurantId, dateFilter),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your restaurant performance
          </p>
        </div>
        <Suspense>
          <DateFilter defaultValue={dateFilter} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats.todayRevenue)}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          title="Today's Orders"
          value={formatNumber(stats.todayOrders)}
          icon={<ShoppingCart className="w-4 h-4" />}
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(stats.avgOrderValue)}
          description="per order"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          title="Customers Today"
          value={formatNumber(stats.customersToday)}
          icon={<Users className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Open Orders"
          value={formatNumber(stats.openOrders)}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          title="Pending Reservations"
          value={formatNumber(stats.pendingReservations)}
          icon={<CalendarCheck className="w-4 h-4" />}
        />
        <StatCard
          title="Low Stock Items"
          value={formatNumber(stats.lowStockItems)}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueChart data={revenueData} />
        <OrdersChart data={ordersData} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoryChart data={categoryData} />
        <TopItemsChart data={topItems} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PaymentChart data={paymentData} />
        <StatusChart data={statusData} />
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[120px] bg-card rounded-xl border animate-pulse" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-[360px] bg-card rounded-xl border animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const dateFilter = params.filter || "last-7-days";

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent dateFilter={dateFilter} />
    </Suspense>
  );
}
