"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
} from "@/app/actions/purchases";
import { getSuppliers } from "@/app/actions/suppliers";
import { getIngredients } from "@/app/actions/inventory";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PurchaseOrder, PurchaseOrderItem } from "@/lib/db/schema";
import {
  Plus,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Package,
  Loader2,
  AlertCircle,
  ShoppingCart,
  FileText,
  Trash2,
} from "lucide-react";

type POWithRelations = PurchaseOrder & {
  supplier: { name: string; company: string | null } | null;
  items: (PurchaseOrderItem & { ingredient: { name: string; unit: string } | null })[];
};

type SupplierRow = { id: string; name: string; company: string | null };
type IngredientRow = { id: string; name: string; unit: string; costPerUnit: string | number };

type POItemDraft = {
  ingredientId: string;
  quantity: string;
  unitCost: string;
};

const PO_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  ordered: "bg-blue-100 text-blue-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_TABS = ["all", "draft", "ordered", "received", "cancelled"];

export default function PurchasesPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<POWithRelations[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([]);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [poItems, setPoItems] = useState<POItemDraft[]>([
    { ingredientId: "", quantity: "", unitCost: "" },
  ]);
  const [poNotes, setPoNotes] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "receive" | "cancel";
    poId: string;
  } | null>(null);

  const fetchPOs = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPurchaseOrders(
        statusFilter !== "all" ? { status: statusFilter } : undefined
      );
      if (result.success) {
        setPurchaseOrders(result.purchaseOrders as POWithRelations[]);
      } else {
        toast.error(result.error || "Failed to load purchase orders");
      }
    } catch {
      toast.error("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [supResult, ingResult] = await Promise.all([
        getSuppliers(),
        getIngredients(),
      ]);
      if (supResult.success) setSuppliers(supResult.suppliers as SupplierRow[]);
      if (ingResult.success) setIngredients(ingResult.ingredients as IngredientRow[]);
    } catch {
      toast.error("Failed to load form data");
    }
  }, []);

  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  useEffect(() => {
    if (createOpen) {
      fetchDropdownData();
    }
  }, [createOpen, fetchDropdownData]);

  const subtotals = poItems.map((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const cost = parseFloat(item.unitCost) || 0;
    return qty * cost;
  });
  const total = subtotals.reduce((sum, s) => sum + s, 0);

  const addPoItem = () => {
    setPoItems([...poItems, { ingredientId: "", quantity: "", unitCost: "" }]);
  };

  const removePoItem = (index: number) => {
    if (poItems.length <= 1) return;
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const updatePoItem = (index: number, field: keyof POItemDraft, value: string) => {
    const updated = [...poItems];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "ingredientId" && value) {
      const ing = ingredients.find((i) => i.id === value);
      if (ing) {
        updated[index].unitCost = toNumber(ing.costPerUnit).toString();
      }
    }

    setPoItems(updated);
  };

  const handleCreate = async () => {
    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }
    const validItems = poItems.filter(
      (item) => item.ingredientId && item.quantity && item.unitCost
    );
    if (validItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createPurchaseOrder({
        supplierId: selectedSupplier,
        items: validItems.map((item) => ({
          ingredientId: item.ingredientId,
          quantity: parseFloat(item.quantity),
          unitCost: parseFloat(item.unitCost),
        })),
        notes: poNotes || undefined,
      });
      if (result.success) {
        toast.success("Purchase order created");
        setCreateOpen(false);
        resetCreateForm();
        fetchPOs();
      } else {
        toast.error(result.error || "Failed to create purchase order");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setSelectedSupplier("");
    setPoItems([{ ingredientId: "", quantity: "", unitCost: "" }]);
    setPoNotes("");
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setSubmitting(true);
    try {
      let result;
      if (confirmAction.type === "receive") {
        result = await receivePurchaseOrder(confirmAction.poId);
      } else {
        result = await cancelPurchaseOrder(confirmAction.poId);
      }
      if (result.success) {
        toast.success(
          confirmAction.type === "receive"
            ? "Purchase order received"
            : "Purchase order cancelled"
        );
        fetchPOs();
      } else {
        toast.error(result.error || "Failed to update purchase order");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
      setConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage purchase orders and receiving
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          New Purchase Order
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total POs</p>
                <p className="text-2xl font-bold">{purchaseOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Received</p>
                <p className="text-2xl font-bold">
                  {purchaseOrders.filter((po) => po.status === "received").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <ShoppingCart className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {purchaseOrders.filter((po) => po.status === "draft" || po.status === "ordered").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setStatusFilter}>
        <TabsList>
          {STATUS_TABS.map((status) => (
            <TabsTrigger key={status} value={status} className="capitalize">
              {status}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO #</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Loading purchase orders...
                  </div>
                </TableCell>
              </TableRow>
            ) : purchaseOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Package className="mb-2 size-8" />
                    <p className="text-sm font-medium">No purchase orders</p>
                    <p className="text-xs">Create your first purchase order</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              purchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    PO-{po.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {po.supplier?.name || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(po.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">{po.items.length}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(toNumber(po.total))}
                  </TableCell>
                  <TableCell>
                    <Badge className={PO_STATUS_COLORS[po.status] || "bg-gray-100 text-gray-700"}>
                      {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {(po.status === "draft" || po.status === "ordered") && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" />}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {po.status === "ordered" && (
                            <DropdownMenuItem
                              onClick={() => {
                                setConfirmAction({ type: "receive", poId: po.id });
                                setConfirmDialogOpen(true);
                              }}
                            >
                              <CheckCircle2 className="mr-2 size-4 text-green-600" />
                              Mark as Received
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setConfirmAction({ type: "cancel", poId: po.id });
                              setConfirmDialogOpen(true);
                            }}
                          >
                            <XCircle className="mr-2 size-4 text-destructive" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <Select value={selectedSupplier} onValueChange={(v) => setSelectedSupplier(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id}>
                      {sup.name} {sup.company ? `(${sup.company})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPoItem}>
                  <Plus className="mr-1 size-3" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {poItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={item.ingredientId}
                      onValueChange={(v) => updatePoItem(index, "ingredientId", v ?? "")}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Ingredient" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients.map((ing) => (
                          <SelectItem key={ing.id} value={ing.id}>
                            {ing.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Qty"
                      className="w-20"
                      value={item.quantity}
                      onChange={(e) => updatePoItem(index, "quantity", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Unit Cost"
                      className="w-24"
                      value={item.unitCost}
                      onChange={(e) => updatePoItem(index, "unitCost", e.target.value)}
                    />
                    <span className="w-20 text-right text-sm font-medium">
                      {formatCurrency(subtotals[index] || 0)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removePoItem(index)}
                      disabled={poItems.length <= 1}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end border-t pt-2">
                <span className="text-sm font-medium">
                  Total: {formatCurrency(total)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create Purchase Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "receive" ? "Receive Order" : "Cancel Order"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <p className="text-sm">
              {confirmAction?.type === "receive"
                ? "This will mark the order as received and increase inventory stock levels. Continue?"
                : "Are you sure you want to cancel this purchase order? This action cannot be undone."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Close
            </Button>
            <Button
              variant={confirmAction?.type === "receive" ? "default" : "destructive"}
              onClick={handleConfirmAction}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {confirmAction?.type === "receive" ? "Confirm Receipt" : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
