"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";

interface StatusChartProps {
  data: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  pending: "#eab308",
  confirmed: "#3b82f6",
  preparing: "#f97316",
  ready: "#a855f7",
  served: "#22c55e",
  completed: "#22c55e",
  cancelled: "#ef4444",
};

function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
}

export function StatusChart({ data }: StatusChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
            No status data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    status: getStatusLabel(d.status),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Order Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formatted}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
              >
                {formatted.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      STATUS_COLORS[entry.status.toLowerCase()] ||
                      `hsl(var(--chart-${(index % 5) + 1}))`
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatNumber(Number(value)), "Count"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
