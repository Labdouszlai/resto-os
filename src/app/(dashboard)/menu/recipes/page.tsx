"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, BookOpen, ChefHat } from "lucide-react";
import {
  getRecipes,
  createRecipe,
  getMenuItems,
} from "@/app/actions/menu";
import { getIngredients } from "@/app/actions/inventory";
import { formatCurrency, toNumber } from "@/lib/format";
import { toast } from "sonner";

const recipeFormSchema = z.object({
  menuItemId: z.string().min(1, "Menu item is required"),
  items: z.array(
    z.object({
      ingredientId: z.string().min(1, "Ingredient is required"),
      quantity: z.number().min(0.01, "Quantity must be positive"),
    })
  ),
});

type RecipeFormData = z.infer<typeof recipeFormSchema>;

interface Recipe {
  id: string;
  menuItemId: string;
  menuItem: { id: string; name: string };
  items: {
    id: string;
    ingredientId: string;
    quantity: string;
    ingredient: { id: string; name: string; unit: string; costPerUnit: string };
  }[];
}

interface MenuItem {
  id: string;
  name: string;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: string;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      menuItemId: "",
      items: [{ ingredientId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const loadData = useCallback(async () => {
    try {
      const [recipeRes, itemRes, ingRes] = await Promise.all([
        getRecipes(),
        getMenuItems(),
        getIngredients(),
      ]);
      if (recipeRes.success) setRecipes(recipeRes.recipes);
      if (itemRes.success) setMenuItems(itemRes.items.map((i) => ({ id: i.id, name: i.name })));
      if (ingRes.success) setIngredients(ingRes.ingredients.map((i) => ({ id: i.id, name: i.name, unit: i.unit, costPerUnit: i.costPerUnit })));
    } catch {
      toast.error("Failed to load recipe data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setEditingRecipe(null);
    form.reset({
      menuItemId: "",
      items: [{ ingredientId: "", quantity: 1 }],
    });
    setDialogOpen(true);
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    form.reset({
      menuItemId: recipe.menuItemId,
      items: recipe.items.map((ri) => ({
        ingredientId: ri.ingredientId,
        quantity: toNumber(ri.quantity),
      })),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);
    try {
      const res = await createRecipe(data.menuItemId, data.items);
      if (res.success) {
        toast.success(editingRecipe ? "Recipe updated" : "Recipe created");
        loadData();
        setDialogOpen(false);
      } else {
        toast.error(res.error || "Failed to save recipe");
      }
    } catch {
      toast.error("Failed to save recipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateRecipeCost = (items: Recipe["items"]) => {
    return items.reduce((sum, ri) => {
      const cost = toNumber(ri.ingredient.costPerUnit);
      const qty = toNumber(ri.quantity);
      return sum + cost * qty;
    }, 0);
  };

  const watchedItems = form.watch("items");

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading recipes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recipe Management</h1>
          <p className="text-sm text-muted-foreground">
            {recipes.length} recipes configured
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="size-4" />
          Add Recipe
        </Button>
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <ChefHat className="mb-2 size-8" />
              <p className="text-sm">No recipes yet</p>
              <p className="text-xs">
                Add recipes to track ingredient costs for menu items
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle>{recipe.menuItem.name}</CardTitle>
                    <Badge variant="secondary">
                      {recipe.items.length} ingredient{recipe.items.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        Recipe Cost
                      </div>
                      <div className="font-medium">
                        {formatCurrency(calculateRecipeCost(recipe.items))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEdit(recipe)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipe.items.map((ri) => {
                      const unitCost = toNumber(ri.ingredient.costPerUnit);
                      const qty = toNumber(ri.quantity);
                      return (
                        <TableRow key={ri.id}>
                          <TableCell className="font-medium">
                            {ri.ingredient.name}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(unitCost)}
                          </TableCell>
                          <TableCell className="text-right">{qty}</TableCell>
                          <TableCell>{ri.ingredient.unit}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(unitCost * qty)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRecipe ? "Edit Recipe" : "Add Recipe"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Menu Item</Label>
              <Select
                value={form.watch("menuItemId")}
                onValueChange={(v) => v && form.setValue("menuItemId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a menu item" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.menuItemId && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.menuItemId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ingredients</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ ingredientId: "", quantity: 1 })}
                >
                  <Plus className="size-3" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      {index === 0 && <Label className="text-xs">Ingredient</Label>}
                      <Select
                        value={form.watch(`items.${index}.ingredientId`)}
                        onValueChange={(v) =>
                          v && form.setValue(`items.${index}.ingredientId`, v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((ing) => (
                            <SelectItem key={ing.id} value={ing.id}>
                              {ing.name} ({formatCurrency(toNumber(ing.costPerUnit))}/{ing.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-1">
                      {index === 0 && <Label className="text-xs">Qty</Label>}
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm font-medium">
                <BookOpen className="mr-1 inline size-4" />
                Estimated Recipe Cost
              </span>
              <span className="font-medium">
                {formatCurrency(
                  watchedItems.reduce((sum, item) => {
                    const ing = ingredients.find((i) => i.id === item.ingredientId);
                    if (!ing) return sum;
                    return sum + toNumber(ing.costPerUnit) * (item.quantity || 0);
                  }, 0)
                )}
              </span>
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
                {editingRecipe ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
