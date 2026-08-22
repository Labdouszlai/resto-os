"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supplierSchema } from "@/lib/validations";
import { z } from "zod";
type TSupplierSchema = z.infer<typeof supplierSchema>;
import { getSupplier, updateSupplier } from "@/app/actions/suppliers";
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
import type { Supplier, PurchaseOrder } from "@/lib/db/schema";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  MapPin,
  StickyNote,
  DollarSign,
  Truck,
  ShoppingBag,
  Loader2,
} from "lucide-react";

const PO_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  ordered: "bg-blue-100 text-blue-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TSupplierSchema>({
    resolver: zodResolver(supplierSchema),
  });

  useEffect(() => {
    async function load() {
      try {
        const result = await getSupplier(supplierId);
        if (result.success && result.supplier) {
          setSupplier(result.supplier);
          setPurchaseHistory(result.purchaseHistory || []);
        } else {
          toast.error("Supplier not found");
          router.push("/suppliers");
        }
      } catch {
        toast.error("Failed to load supplier");
        router.push("/suppliers");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supplierId, router]);

  const openEditDialog = () => {
    if (!supplier) return;
    reset({
      name: supplier.name,
      company: supplier.company || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      notes: supplier.notes || "",
    });
    setEditOpen(true);
  };

  const onSubmit = async (data: TSupplierSchema) => {
    if (!supplier) return;
    setSubmitting(true);
    try {
      const result = await updateSupplier(supplier.id, data);
      if (result.success) {
        toast.success("Supplier updated");
        setEditOpen(false);
        setSupplier(result.supplier!);
      } else {
        toast.error(result.error || "Failed to update supplier");
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

  if (!supplier) return null;

  const totalPurchases = purchaseHistory.reduce(
    (sum, po) => sum + toNumber(po.total),
    0
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/suppliers")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{supplier.name}</h1>
            <p className="text-sm text-muted-foreground">
              {supplier.company || "Supplier Details"}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={openEditDialog}>
          <Pencil className="mr-2 size-4" />
          Edit
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <ShoppingBag className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="text-xl font-bold">{purchaseHistory.length}</p>
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
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-xl font-bold">{formatCurrency(totalPurchases)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Truck className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Supplier Since</p>
                <p className="text-sm font-bold">{formatDate(supplier.createdAt)}</p>
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
              <span>{supplier.email || "No email"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="size-4 text-muted-foreground" />
              <span>{supplier.phone || "No phone"}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span>{supplier.address || "No address"}</span>
            </div>
            {supplier.notes && (
              <div className="flex items-start gap-3 text-sm">
                <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>{supplier.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            {purchaseHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <ShoppingBag className="mb-2 size-8" />
                <p className="text-sm">No purchase orders yet</p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO #</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseHistory.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          PO-{po.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(toNumber(po.total))}
                        </TableCell>
                        <TableCell>
                          <Badge className={PO_STATUS_COLORS[po.status] || "bg-gray-100 text-gray-700"}>
                            {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(po.createdAt)}
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
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" {...register("company")} />
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
