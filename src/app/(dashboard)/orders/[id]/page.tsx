"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  Package,
} from "lucide-react";
import { formatCurrency, toNumber, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/format";
import { getOrder, updateOrderStatus, cancelOrder, completeOrder, payOrder } from "@/app/actions/orders";
import { toast } from "sonner";

interface OrderItemModifier {
  modifier: { name: string };
  price: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  subtotal: string;
  notes: string | null;
  menuItem: { name: string; price: string };
  modifiers: OrderItemModifier[];
}

interface OrderData {
  id: string;
  orderNumber: string;
  type: string;
  status: string;
  total: string;
  subtotal: string;
  tax: string;
  discount: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  restaurantId: string;
  branchId: string;
  tableId: string | null;
  customerId: string | null;
  items: OrderItem[];
  table?: { number: string } | null;
  customer?: { name: string } | null;
  payments?: Array<{ status: string; amount: string }>;
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await getOrder(id);
        if (res.success && res.order) setOrder(res.order as OrderData);
      } catch {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await updateOrderStatus(id, newStatus);
      if (res.success) {
        setOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
        toast.success(`Order status updated to ${ORDER_STATUS_LABELS[newStatus as keyof typeof ORDER_STATUS_LABELS]}`);
        setStatusDialogOpen(false);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await cancelOrder(id);
      if (res.success) {
        setOrder((prev) => prev ? { ...prev, status: "cancelled" } : prev);
        toast.success("Order cancelled");
      } else {
        toast.error(res.error || "Failed to cancel order");
      }
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      const res = await completeOrder(id);
      if (res.success) {
        setOrder((prev) => prev ? { ...prev, status: "completed" } : prev);
        toast.success("Order completed");
      } else {
        toast.error(res.error || "Failed to complete order");
      }
    } catch {
      toast.error("Failed to complete order");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;
    setActionLoading(true);
    try {
      const total = toNumber(order.total);
      const res = await payOrder(id, {
        amount: total,
        method: paymentMethod,
      });
      if (res.success) {
        toast.success("Payment processed");
        setPaymentDialogOpen(false);
        const refreshRes = await getOrder(id);
        if (refreshRes.success && refreshRes.order) setOrder(refreshRes.order as OrderData);
      } else {
        toast.error(res.error || "Failed to process payment");
      }
    } catch {
      toast.error("Failed to process payment");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <Package className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Order not found</p>
        <Button variant="outline" onClick={() => router.push("/orders")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const totalPaid = (order.payments as Array<{ status: string; amount: string }> | undefined)
    ?.filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + toNumber(p.amount), 0) || 0;
  const balance = toNumber(order.total) - totalPaid;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.push("/orders")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge className={ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}>
            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Order #</span>
              <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="outline" className="capitalize">{order.type}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Table</span>
              <span className="text-sm">{order.table ? `Table ${order.table.number}` : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Customer</span>
              <span className="text-sm">{order.customer?.name || "Walk-in"}</span>
            </div>
            {order.notes && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Notes</span>
                <span className="text-sm">{order.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(toNumber(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(toNumber(order.tax))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span>{formatCurrency(toNumber(order.discount))}</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(toNumber(order.total))}</span>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance</span>
                <span className={balance > 0 ? "text-red-600" : "text-green-600"}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.menuItem?.name || "Item"}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.quantity} x {formatCurrency(toNumber(item.price))}
                    {item.modifiers?.length > 0 && (
                      <span> + {item.modifiers.map((m) => m.modifier?.name).filter(Boolean).join(", ")}</span>
                    )}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {formatCurrency(toNumber(item.subtotal))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {["pending", "confirmed", "preparing", "ready", "served"].includes(order.status) && (
          <Button variant="outline" onClick={() => setStatusDialogOpen(true)}>
            <Clock className="size-4" />
            Change Status
          </Button>
        )}
        {["pending", "confirmed", "preparing", "ready", "served"].includes(order.status) && (
          <Button variant="destructive" onClick={handleCancel} disabled={actionLoading}>
            <XCircle className="size-4" />
            Cancel Order
          </Button>
        )}
        {["served"].includes(order.status) && (
          <Button onClick={handleComplete} disabled={actionLoading}>
            <CheckCircle className="size-4" />
            Complete Order
          </Button>
        )}
        {balance > 0 && order.status !== "cancelled" && (
          <Button onClick={() => setPaymentDialogOpen(true)}>
            <CreditCard className="size-4" />
            Process Payment
          </Button>
        )}
      </div>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {["pending", "confirmed", "preparing", "ready", "served", "completed"].map(
              (s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={actionLoading}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                    order.status === s ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div
                    className={`size-3 rounded-full ${ORDER_STATUS_COLORS[s as keyof typeof ORDER_STATUS_COLORS]?.split(" ")[0]}`}
                  />
                  <span className="text-sm font-medium">
                    {ORDER_STATUS_LABELS[s as keyof typeof ORDER_STATUS_LABELS]}
                  </span>
                </button>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-sm text-muted-foreground">Amount Due</div>
              <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["cash", "card", "other"].map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`rounded-lg border p-3 text-sm font-medium capitalize transition-colors ${
                    paymentMethod === m
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={actionLoading}>
              <CreditCard className="size-4" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
