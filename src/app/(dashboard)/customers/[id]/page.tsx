"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { customerSchema } from "@/lib/validations";
import { z } from "zod";
type TCustomerSchema = z.infer<typeof customerSchema>;
import { getCustomer, updateCustomer } from "@/app/actions/customers";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer, Order } from "@/lib/db/schema";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  MapPin,
  StickyNote,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Loader2,
} from "lucide-react";

const ORDER_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-purple-100 text-purple-700",
  served: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TCustomerSchema>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    async function load() {
      try {
        const result = await getCustomer(customerId);
        if (result.success && result.customer) {
          setCustomer(result.customer);
          setOrderHistory(result.orderHistory || []);
        } else {
          toast.error("Customer not found");
          router.push("/customers");
        }
      } catch {
        toast.error("Failed to load customer");
        router.push("/customers");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [customerId, router]);

  const openEditDialog = () => {
    if (!customer) return;
    reset({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      notes: customer.notes || "",
    });
    setEditOpen(true);
  };

  const onSubmit = async (data: TCustomerSchema) => {
    if (!customer) return;
    setSubmitting(true);
    try {
      const result = await updateCustomer(customer.id, data);
      if (result.success) {
        toast.success("Customer updated");
        setEditOpen(false);
        setCustomer(result.customer!);
      } else {
        toast.error(result.error || "Failed to update customer");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customer) return null;

  const totalSpending = orderHistory.reduce(
    (sum, o) => sum + toNumber(o.total),
    0
  );
  const avgOrderValue =
    orderHistory.length > 0 ? totalSpending / orderHistory.length : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/customers")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p className="text-sm text-muted-foreground">Customer Details</p>
          </div>
        </div>
        <Button variant="outline" onClick={openEditDialog}>
          <Pencil className="mr-2 size-4" />
          Edit
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <ShoppingBag className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="text-xl font-bold">{orderHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <DollarSign className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Spending</p>
                <p className="text-xl font-bold">{formatCurrency(totalSpending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Order Value</p>
                <p className="text-xl font-bold">{formatCurrency(avgOrderValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Calendar className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Customer Since</p>
                <p className="text-sm font-bold">{formatDate(customer.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="size-4 text-muted-foreground" />
              <span>{customer.email || "No email"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="size-4 text-muted-foreground" />
              <span>{customer.phone || "No phone"}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>{customer.address || "No address"}</span>
            </div>
            {customer.notes && (
              <div className="flex items-start gap-3 text-sm">
                <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>{customer.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {orderHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <ShoppingBag className="mb-2 size-8" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderHistory.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {order.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(toNumber(order.total))}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={ORDER_STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register("notes")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
