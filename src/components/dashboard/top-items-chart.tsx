"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

interface TopItemsChartProps {
  data: { name: string; quantity: number; revenue: number }[];
}

export function TopItemsChart({ data }: TopItemsChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
            No sales data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Top Selling Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                width={80}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "revenue") return [formatCurrency(Number(value)), "Revenue"];
                  return [Number(value), "Quantity"];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="quantity"
                fill="hsl(var(--chart-2))"
                radius={[0, 4, 4, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
