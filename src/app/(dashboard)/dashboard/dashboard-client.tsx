"use client";

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
import { useTranslation } from "@/i18n/provider";

interface DashboardClientProps {
  dateFilter: string;
  stats: {
    todayRevenue: number;
    todayOrders: number;
    avgOrderValue: number;
    customersToday: number;
    openOrders: number;
    pendingReservations: number;
    lowStockItems: number;
  };
  revenueData: any[];
  ordersData: any[];
  categoryData: any[];
  topItems: any[];
  paymentData: any[];
  statusData: any[];
}

export function DashboardClient({
  dateFilter,
  stats,
  revenueData,
  ordersData,
  categoryData,
  topItems,
  paymentData,
  statusData,
}: DashboardClientProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("nav.dashboard")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboard.overview")}
          </p>
        </div>
        <DateFilter defaultValue={dateFilter} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.todaysRevenue")}
          value={formatCurrency(stats.todayRevenue)}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          title={t("dashboard.todaysOrders")}
          value={formatNumber(stats.todayOrders)}
          icon={<ShoppingCart className="w-4 h-4" />}
        />
        <StatCard
          title={t("dashboard.avgOrderValue")}
          value={formatCurrency(stats.avgOrderValue)}
          description={t("dashboard.perOrder")}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          title={t("dashboard.customersToday")}
          value={formatNumber(stats.customersToday)}
          icon={<Users className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title={t("dashboard.openOrders")}
          value={formatNumber(stats.openOrders)}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          title={t("dashboard.pendingReservations")}
          value={formatNumber(stats.pendingReservations)}
          icon={<CalendarCheck className="w-4 h-4" />}
        />
        <StatCard
          title={t("dashboard.lowStockItems")}
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
