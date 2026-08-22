"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ImageIcon,
  Tag,
  UtensilsCrossed,
  ToggleLeft,
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getModifiers,
  createModifier,
  updateModifier,
  deleteModifier,
} from "@/app/actions/menu";
import { formatCurrency, toNumber } from "@/lib/format";
import { toast } from "sonner";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sortOrder: z.number().min(0).optional(),
});

const menuItemFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  preparationTime: z.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  cost: z.number().min(0).optional(),
  sku: z.string().optional(),
});

const modifierFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0).optional(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;
type MenuItemFormData = z.infer<typeof menuItemFormSchema>;
type ModifierFormData = z.infer<typeof modifierFormSchema>;

interface Category {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  cost: string;
  sku: string | null;
  isAvailable: boolean;
  categoryId: string;
  preparationTime: number | null;
  taxRate: string;
  category: { id: string; name: string };
}

interface Modifier {
  id: string;
  name: string;
  price: string;
}

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState("items");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    Category | MenuItem | Modifier | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogType, setDialogType] = useState<
    "category" | "item" | "modifier"
  >("item");

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", description: "", sortOrder: 0 },
  });

  const itemForm = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      preparationTime: undefined,
      isAvailable: true,
      taxRate: 0,
      cost: 0,
      sku: "",
    },
  });

  const modifierForm = useForm<ModifierFormData>({
    resolver: zodResolver(modifierFormSchema),
    defaultValues: { name: "", price: 0 },
  });

  const loadData = useCallback(async () => {
    try {
      const [catRes, itemRes, modRes] = await Promise.all([
        getCategories(),
        getMenuItems(),
        getModifiers(),
      ]);
      if (catRes.success) setCategories(catRes.categories);
      if (itemRes.success) setMenuItems(itemRes.items);
      if (modRes.success) setModifiers(modRes.modifiers);
    } catch {
      toast.error("Failed to load menu data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = (type: "category" | "item" | "modifier") => {
    setEditingItem(null);
    setDialogType(type);
    categoryForm.reset({ name: "", description: "", sortOrder: 0 });
    itemForm.reset({
      name: "",
      description: "",
      price: 0,
      categoryId: categories[0]?.id || "",
      preparationTime: undefined,
      isAvailable: true,
      taxRate: 0,
      cost: 0,
      sku: "",
    });
    modifierForm.reset({ name: "", price: 0 });
    setDialogOpen(true);
  };

  const handleEdit = (
    type: "category" | "item" | "modifier",
    item: Category | MenuItem | Modifier
  ) => {
    setEditingItem(item);
    setDialogType(type);

    if (type === "category") {
      const cat = item as Category;
      categoryForm.reset({
        name: cat.name,
        description: cat.description || "",
        sortOrder: cat.sortOrder,
      });
    } else if (type === "item") {
      const mi = item as MenuItem;
      itemForm.reset({
        name: mi.name,
        description: mi.description || "",
        price: toNumber(mi.price),
        categoryId: mi.categoryId,
        preparationTime: mi.preparationTime ?? undefined,
        isAvailable: mi.isAvailable,
        taxRate: toNumber(mi.taxRate),
        cost: toNumber(mi.cost),
        sku: mi.sku || "",
      });
    } else {
      const mod = item as Modifier;
      modifierForm.reset({
        name: mod.name,
        price: toNumber(mod.price),
      });
    }
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    setIsSubmitting(true);
    try {
      let res;
      if (dialogType === "category") {
        res = await deleteCategory(editingItem.id);
      } else if (dialogType === "item") {
        res = await deleteMenuItem(editingItem.id);
      } else {
        res = await deleteModifier(editingItem.id);
      }
      if (res.success) {
        toast.success(
          `${dialogType === "category" ? "Category" : dialogType === "item" ? "Menu item" : "Modifier"} deleted`
        );
        loadData();
        setDeleteDialogOpen(false);
      } else {
        toast.error(res.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      const res = editingItem
        ? await updateCategory(editingItem.id, {
            name: data.name,
            description: data.description,
            sortOrder: data.sortOrder,
          })
        : await createCategory({
            name: data.name,
            description: data.description,
            sortOrder: data.sortOrder,
          });
      if (res.success) {
        toast.success(editingItem ? "Category updated" : "Category created");
        loadData();
        setDialogOpen(false);
      } else {
        toast.error(res.error || "Failed to save category");
      }
    } catch {
      toast.error("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemSubmit = async (data: MenuItemFormData) => {
    setIsSubmitting(true);
    try {
      const res = editingItem
        ? await updateMenuItem(editingItem.id, {
            name: data.name,
            description: data.description,
            price: data.price,
            categoryId: data.categoryId,
            preparationTime: data.preparationTime,
            isAvailable: data.isAvailable,
            taxRate: data.taxRate,
            cost: data.cost,
            sku: data.sku,
          })
        : await createMenuItem({
            name: data.name,
            description: data.description,
            price: data.price,
            categoryId: data.categoryId,
            preparationTime: data.preparationTime,
            isAvailable: data.isAvailable,
            taxRate: data.taxRate,
            cost: data.cost,
            sku: data.sku,
          });
      if (res.success) {
        toast.success(editingItem ? "Menu item updated" : "Menu item created");
        loadData();
        setDialogOpen(false);
      } else {
        toast.error(res.error || "Failed to save menu item");
      }
    } catch {
      toast.error("Failed to save menu item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModifierSubmit = async (data: ModifierFormData) => {
    setIsSubmitting(true);
    try {
      const res = editingItem
        ? await updateModifier(editingItem.id, {
            name: data.name,
            price: data.price,
          })
        : await createModifier({
            name: data.name,
            price: data.price,
          });
      if (res.success) {
        toast.success(editingItem ? "Modifier updated" : "Modifier created");
        loadData();
        setDialogOpen(false);
      } else {
        toast.error(res.error || "Failed to save modifier");
      }
    } catch {
      toast.error("Failed to save modifier");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const res = await updateMenuItem(item.id, {
        isAvailable: !item.isAvailable,
      });
      if (res.success) {
        setMenuItems((prev) =>
          prev.map((mi) =>
            mi.id === item.id
              ? { ...mi, isAvailable: !mi.isAvailable }
              : mi
          )
        );
        toast.success(
          `Item ${item.isAvailable ? "marked unavailable" : "marked available"}`
        );
      }
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || item.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-sm text-muted-foreground">
            {menuItems.length} items &middot; {categories.length} categories
          </p>
        </div>
        <Button onClick={() => handleCreate(activeTab === "items" ? "item" : activeTab === "categories" ? "category" : "modifier")}>
          <Plus className="size-4" />
          Add {activeTab === "items" ? "Item" : activeTab === "categories" ? "Category" : "Modifier"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)}>
        <TabsList variant="line">
          <TabsTrigger value="items">
            <UtensilsCrossed className="size-4" />
            Menu Items
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tag className="size-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="modifiers">
            <ToggleLeft className="size-4" />
            Modifiers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Menu Items</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={filterCategory} onValueChange={(v) => v && setFilterCategory(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <UtensilsCrossed className="mb-2 size-8" />
                  <p className="text-sm">No menu items found</p>
                  <p className="text-xs">Add items to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12" />
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const price = toNumber(item.price);
                      const cost = toNumber(item.cost);
                      const margin = price - cost;
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                              <ImageIcon className="size-4 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {item.category.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(cost)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                margin >= 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }
                            >
                              {formatCurrency(margin)}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.sku || "—"}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => handleToggleAvailability(item)}
                              className="cursor-pointer"
                            >
                              <Badge
                                variant={item.isAvailable ? "default" : "outline"}
                                className={
                                  item.isAvailable
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "text-muted-foreground"
                                }
                              >
                                {item.isAvailable ? "Yes" : "No"}
                              </Badge>
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleEdit("item", item)}
                              >
                                <Pencil className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => {
                                  setEditingItem(item);
                                  setDialogType("item");
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="size-3 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Tag className="mb-2 size-8" />
                  <p className="text-sm">No categories yet</p>
                  <p className="text-xs">Add a category to organize your menu</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Sort</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {cat.description || "—"}
                        </TableCell>
                        <TableCell className="text-right">{cat.sortOrder}</TableCell>
                        <TableCell>
                          <Badge
                            variant={cat.isActive ? "default" : "outline"}
                            className={
                              cat.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "text-muted-foreground"
                            }
                          >
                            {cat.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleEdit("category", cat)}
                            >
                              <Pencil className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setEditingItem(cat);
                                setDialogType("category");
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="size-3 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modifiers">
          <Card>
            <CardHeader>
              <CardTitle>Modifiers</CardTitle>
            </CardHeader>
            <CardContent>
              {modifiers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ToggleLeft className="mb-2 size-8" />
                  <p className="text-sm">No modifiers yet</p>
                  <p className="text-xs">Add modifiers like toppings or sides</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modifiers.map((mod) => (
                      <TableRow key={mod.id}>
                        <TableCell className="font-medium">{mod.name}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(toNumber(mod.price))}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleEdit("modifier", mod)}
                            >
                              <Pencil className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setEditingItem(mod);
                                setDialogType("modifier");
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="size-3 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Add"}{" "}
              {dialogType === "category"
                ? "Category"
                : dialogType === "item"
                  ? "Menu Item"
                  : "Modifier"}
            </DialogTitle>
          </DialogHeader>

          {dialogType === "category" && (
            <form
              onSubmit={categoryForm.handleSubmit(handleCategorySubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  {...categoryForm.register("name")}
                  placeholder="e.g. Appetizers"
                />
                {categoryForm.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {categoryForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  {...categoryForm.register("description")}
                  placeholder="Optional description"
                />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  {...categoryForm.register("sortOrder", { valueAsNumber: true })}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {editingItem ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {dialogType === "item" && (
            <form
              onSubmit={itemForm.handleSubmit(handleItemSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    {...itemForm.register("name")}
                    placeholder="e.g. Caesar Salad"
                  />
                  {itemForm.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {itemForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={itemForm.watch("categoryId")}
                    onValueChange={(v) => v && itemForm.setValue("categoryId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {itemForm.formState.errors.categoryId && (
                    <p className="text-xs text-destructive">
                      {itemForm.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  {...itemForm.register("description")}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...itemForm.register("price", { valueAsNumber: true })}
                  />
                  {itemForm.formState.errors.price && (
                    <p className="text-xs text-destructive">
                      {itemForm.formState.errors.price.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...itemForm.register("cost", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Margin</Label>
                  <div className="flex h-8 items-center rounded-lg border border-input bg-muted px-2.5 text-sm">
                    {formatCurrency(
                      (itemForm.watch("price") || 0) -
                        (itemForm.watch("cost") || 0)
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input
                    {...itemForm.register("sku")}
                    placeholder="e.g. APP-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...itemForm.register("taxRate", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prep Time (min)</Label>
                  <Input
                    type="number"
                    {...itemForm.register("preparationTime", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isAvailable"
                  checked={itemForm.watch("isAvailable")}
                  onCheckedChange={(checked) =>
                    itemForm.setValue("isAvailable", checked === true)
                  }
                />
                <Label htmlFor="isAvailable" className="cursor-pointer">
                  Available for ordering
                </Label>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {editingItem ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {dialogType === "modifier" && (
            <form
              onSubmit={modifierForm.handleSubmit(handleModifierSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  {...modifierForm.register("name")}
                  placeholder="e.g. Extra Cheese"
                />
                {modifierForm.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {modifierForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...modifierForm.register("price", { valueAsNumber: true })}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {editingItem ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {dialogType === "category" ? "Category" : dialogType === "item" ? "Menu Item" : "Modifier"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &quot;{editingItem?.name}&quot;? This
            action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
