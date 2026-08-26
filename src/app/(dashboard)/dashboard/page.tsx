import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import {
  getDashboardStats,
  getRevenueOverTime,
  getOrdersOverTime,
  getRevenueByCategory,
  getTopSellingItems,
  getPaymentMethodsDistribution,
  getOrderStatusDistribution,
} from "@/lib/queries/dashboard";
import { requireAuth } from "@/lib/auth/server";

async function DashboardContent({ dateFilter }: { dateFilter: string }) {
  const { restaurant } = await requireAuth();
  if (!restaurant) redirect("/sign-in");

  const restaurantId = restaurant.id;

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
    <DashboardClient
      dateFilter={dateFilter}
      stats={stats}
      revenueData={revenueData}
      ordersData={ordersData}
      categoryData={categoryData}
      topItems={topItems}
      paymentData={paymentData}
      statusData={statusData}
    />
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
