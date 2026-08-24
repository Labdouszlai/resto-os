import Link from "next/link";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/auth/server";
import { eq, and, ilike, desc, count } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  formatCurrency,
  toNumber,
  formatDateTime,
} from "@/lib/format";
import {
  Eye,
  Clock,
  Search,
  Package,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const restaurant = { id: "b0000000-0000-0000-0000-000000000001" };

  const status = typeof params.status === "string" ? params.status : "all";
  const search = typeof params.search === "string" ? params.search : "";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(orders.restaurantId, restaurant.id)];
  if (status !== "all") {
    conditions.push(eq(orders.status, status));
  }
  if (search) {
    conditions.push(ilike(orders.orderNumber, `%${search}%`));
  }

  const where = and(...conditions);

  const [totalResult] = await db
    .select({ value: count() })
    .from(orders)
    .where(where);

  const orderResults = (await db.query.orders.findMany({
    where,
    orderBy: [desc(orders.createdAt)],
    limit,
    offset,
    with: {
      items: true,
      table: true,
      customer: true,
    },
  })) as Array<{
    id: string;
    orderNumber: string;
    type: string;
    status: string;
    total: string;
    createdAt: Date;
    items: unknown[];
    table: { number: string } | null;
  }>;

  const totalPages = Math.ceil(totalResult.value / limit);

  const statusTabs = [
    "all",
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "served",
    "completed",
    "cancelled",
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            {totalResult.value} total orders
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        {statusTabs.map((s) => (
          <Link
            key={s}
            href={`/orders?status=${s}${search ? `&search=${search}` : ""}`}
          >
            <Badge
              variant={status === s ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
            >
              {s === "all" ? "All" : ORDER_STATUS_LABELS[s as keyof typeof ORDER_STATUS_LABELS]}
            </Badge>
          </Link>
        ))}
      </div>

      <form className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search order number..."
            defaultValue={search}
            className="pl-8"
          />
          <input type="hidden" name="status" value={status} />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Search
        </Button>
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Package className="mb-2 size-8" />
                    <p className="text-sm">No orders found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orderResults.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    {order.table ? `T${order.table.number}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {order.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(toNumber(order.total))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`size-2 rounded-full ${
                          ORDER_STATUS_COLORS[
                            order.status as keyof typeof ORDER_STATUS_COLORS
                          ]?.split(" ")[0] || "bg-gray-100"
                        }`}
                      />
                      <span className="text-sm">
                        {ORDER_STATUS_LABELS[
                          order.status as keyof typeof ORDER_STATUS_LABELS
                        ] || order.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatDateTime(order.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="icon-sm">
                        <Eye className="size-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/orders?status=${status}&search=${search}&page=${page - 1}`}
              >
                <Button variant="outline" size="sm">
                  Previous
                </Button>
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/orders?status=${status}&search=${search}&page=${page + 1}`}
              >
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
