"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ingredientSchema } from "@/lib/validations";
import { z } from "zod";
type TIngredientSchema = z.infer<typeof ingredientSchema>;
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  adjustStock,
  getStockMovements,
  getLowStockItems,
} from "@/app/actions/inventory";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Ingredient, InventoryMovement } from "@/lib/db/schema";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  MinusCircle,
  PlusCircle,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  Warehouse,
  Box,
} from "lucide-react";

type IngredientWithSupplier = Ingredient & {
  supplier?: { name: string } | null;
};

type MovementWithIngredient = InventoryMovement & {
  ingredient?: { name: string; unit: string } | null;
};

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<IngredientWithSupplier[]>([]);
  const [movements, setMovements] = useState<MovementWithIngredient[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [movementFilter, setMovementFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<IngredientWithSupplier | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingIngredient, setDeletingIngredient] = useState<IngredientWithSupplier | null>(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustingIngredient, setAdjustingIngredient] = useState<IngredientWithSupplier | null>(null);
  const [adjustType, setAdjustType] = useState("addition");
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustNotes, setAdjustNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("ingredients");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TIngredientSchema>({
    resolver: zodResolver(ingredientSchema),
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ingResult, lowResult] = await Promise.all([
        getIngredients({ search: debouncedSearch || undefined }),
        getLowStockItems(),
      ]);
      if (ingResult.success) {
        setIngredients(ingResult.ingredients as IngredientWithSupplier[]);
      }
      if (lowResult.success) {
        setLowStockItems(lowResult.items);
      }
    } catch {
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  const fetchMovements = useCallback(async () => {
    try {
      const result = await getStockMovements();
      if (result.success) {
        setMovements(result.movements as MovementWithIngredient[]);
      }
    } catch {
      toast.error("Failed to load stock movements");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === "movements") {
      fetchMovements();
    }
  }, [activeTab, fetchMovements]);

  const onSubmit = async (data: TIngredientSchema) => {
    setSubmitting(true);
    try {
      if (editingIngredient) {
        const result = await updateIngredient(editingIngredient.id, {
          name: data.name,
          sku: data.sku,
          unit: data.unit,
          currentStock: data.currentStock,
          minimumStock: data.minimumStock,
          costPerUnit: data.costPerUnit,
          supplierId: data.supplierId,
          expirationDate: data.expirationDate,
        });
        if (result.success) {
          toast.success("Ingredient updated");
          setDialogOpen(false);
          setEditingIngredient(null);
          fetchData();
        } else {
          toast.error(result.error || "Failed to update ingredient");
        }
      } else {
        const result = await createIngredient({
          name: data.name,
          sku: data.sku,
          unit: data.unit,
          currentStock: data.currentStock,
          minimumStock: data.minimumStock,
          costPerUnit: data.costPerUnit,
          supplierId: data.supplierId,
          expirationDate: data.expirationDate,
        });
        if (result.success) {
          toast.success("Ingredient added");
          setDialogOpen(false);
          fetchData();
        } else {
          toast.error(result.error || "Failed to create ingredient");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingIngredient) return;
    setSubmitting(true);
    try {
      const result = await deleteIngredient(deletingIngredient.id);
      if (result.success) {
        toast.success("Ingredient deleted");
        setDeleteDialogOpen(false);
        setDeletingIngredient(null);
        fetchData();
      } else {
        toast.error(result.error || "Failed to delete ingredient");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjust = async () => {
    if (!adjustingIngredient || !adjustQty) return;
    const qty = parseFloat(adjustQty);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    setSubmitting(true);
    try {
      const result = await adjustStock(
        adjustingIngredient.id,
        adjustType,
        qty,
        adjustNotes || undefined
      );
      if (result.success) {
        toast.success(`Stock ${adjustType === "addition" ? "added" : adjustType === "deduction" ? "deducted" : "adjusted"}`);
        setAdjustDialogOpen(false);
        setAdjustingIngredient(null);
        setAdjustQty("");
        setAdjustNotes("");
        fetchData();
      } else {
        toast.error(result.error || "Failed to adjust stock");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateDialog = () => {
    setEditingIngredient(null);
    reset({
      name: "",
      sku: "",
      unit: "",
      currentStock: 0,
      minimumStock: 0,
      costPerUnit: 0,
      supplierId: "",
      expirationDate: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (ing: IngredientWithSupplier, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingIngredient(ing);
    reset({
      name: ing.name,
      sku: ing.sku,
      unit: ing.unit,
      currentStock: toNumber(ing.currentStock),
      minimumStock: toNumber(ing.minimumStock),
      costPerUnit: toNumber(ing.costPerUnit),
      supplierId: ing.supplierId || "",
      expirationDate: ing.expirationDate || "",
    });
    setDialogOpen(true);
  };

  const openAdjustDialog = (ing: IngredientWithSupplier, e: React.MouseEvent) => {
    e.stopPropagation();
    setAdjustingIngredient(ing);
    setAdjustType("addition");
    setAdjustQty("");
    setAdjustNotes("");
    setAdjustDialogOpen(true);
  };

  const getStockStatus = (ing: Ingredient) => {
    const current = toNumber(ing.currentStock);
    const min = toNumber(ing.minimumStock);
    if (current === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-700" };
    if (min > 0 && current <= min) return { label: "Low Stock", color: "bg-amber-100 text-amber-700" };
    return { label: "In Stock", color: "bg-green-100 text-green-700" };
  };

  const getStockRowClass = (ing: Ingredient) => {
    const current = toNumber(ing.currentStock);
    const min = toNumber(ing.minimumStock);
    if (current === 0) return "bg-red-50";
    if (min > 0 && current <= min) return "bg-amber-50";
    return "";
  };

  const totalInventoryValue = ingredients.reduce(
    (sum, ing) => sum + toNumber(ing.currentStock) * toNumber(ing.costPerUnit),
    0
  );

  const filteredMovements = movements.filter((m) => {
    if (movementFilter === "all") return true;
    return m.type === movementFilter;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage ingredients and stock levels
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          Add Ingredient
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Box className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{ingredients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Warehouse className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ingredients" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ingredients">
            <Package className="mr-1.5 size-4" />
            Ingredients
          </TabsTrigger>
          <TabsTrigger value="movements">
            <ArrowUpDown className="mr-1.5 size-4" />
            Stock Movements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="space-y-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Min Stock</TableHead>
                  <TableHead className="text-right">Cost/Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <div className="flex items-center justify-center py-12 text-muted-foreground">
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Loading inventory...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : ingredients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Package className="mb-2 size-8" />
                        <p className="text-sm font-medium">No ingredients found</p>
                        <p className="text-xs">
                          {search ? "Try a different search" : "Add your first ingredient to get started"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  ingredients.map((ing) => {
                    const status = getStockStatus(ing);
                    return (
                      <TableRow key={ing.id} className={getStockRowClass(ing)}>
                        <TableCell className="font-medium">{ing.name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {ing.sku}
                        </TableCell>
                        <TableCell>{ing.unit}</TableCell>
                        <TableCell className="text-right font-medium">
                          {toNumber(ing.currentStock)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {toNumber(ing.minimumStock)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(toNumber(ing.costPerUnit))}
                        </TableCell>
                        <TableCell>
                          <Badge className={status.color}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ing.expirationDate ? formatDate(ing.expirationDate) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon-sm" />}
                            >
                              <MoreHorizontal className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => openAdjustDialog(ing, e)}>
                                <ArrowUpDown className="mr-2 size-4" />
                                Adjust Stock
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => openEditDialog(ing, e)}>
                                <Pencil className="mr-2 size-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingIngredient(ing);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 size-4 text-destructive" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4 pt-4">
          <div className="flex items-center gap-3">
            <Select value={movementFilter} onValueChange={(v) => setMovementFilter(v ?? "")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="addition">Addition</SelectItem>
                <SelectItem value="deduction">Deduction</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <ArrowUpDown className="mb-2 size-8" />
                        <p className="text-sm font-medium">No stock movements</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(mov.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {mov.ingredient?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            mov.type === "addition"
                              ? "bg-green-100 text-green-700"
                              : mov.type === "deduction"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }
                        >
                          {mov.type === "addition" && <PlusCircle className="mr-1 size-3" />}
                          {mov.type === "deduction" && <MinusCircle className="mr-1 size-3" />}
                          {mov.type.charAt(0).toUpperCase() + mov.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {toNumber(mov.quantity)} {mov.ingredient?.unit || ""}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {mov.notes || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? "Edit Ingredient" : "Add Ingredient"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name")} placeholder="Flour" />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" {...register("sku")} placeholder="ING-001" />
                {errors.sku && (
                  <p className="text-xs text-destructive">{errors.sku.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Input id="unit" {...register("unit")} placeholder="kg, lbs, liters..." />
              {errors.unit && (
                <p className="text-xs text-destructive">{errors.unit.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  step="0.01"
                  {...register("currentStock", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumStock">Min Stock</Label>
                <Input
                  id="minimumStock"
                  type="number"
                  step="0.01"
                  {...register("minimumStock", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPerUnit">Cost/Unit</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  step="0.01"
                  {...register("costPerUnit", { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Input
                id="expirationDate"
                type="date"
                {...register("expirationDate")}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingIngredient ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Adjusting stock for <strong>{adjustingIngredient?.name}</strong>
              <br />
              Current: {adjustingIngredient ? toNumber(adjustingIngredient.currentStock) : 0} {adjustingIngredient?.unit}
            </p>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={adjustType} onValueChange={(v) => setAdjustType(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="addition">Add Stock</SelectItem>
                  <SelectItem value="deduction">Deduct Stock</SelectItem>
                  <SelectItem value="adjustment">Set to Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                placeholder="Reason for adjustment..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjust} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Ingredient</DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <p className="text-sm">
              Are you sure you want to delete{" "}
              <strong>{deletingIngredient?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
