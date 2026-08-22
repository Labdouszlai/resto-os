"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { expenseSchema } from "@/lib/validations";
import { z } from "zod";
type TExpenseSchema = z.infer<typeof expenseSchema>;
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/app/actions/expenses";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
import { getMyBranches } from "@/app/actions/branch";
import type { Expense, Branch } from "@/lib/db/schema";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Receipt,
  DollarSign,
  Tag,
  Loader2,
  AlertCircle,
  Calendar,
} from "lucide-react";

const EXPENSE_CATEGORIES = [
  "rent",
  "utilities",
  "salaries",
  "ingredients",
  "supplies",
  "marketing",
  "maintenance",
  "insurance",
  "taxes",
  "transport",
  "packaging",
  "cleaning",
  "technology",
  "other",
];

const CATEGORY_COLORS: Record<string, string> = {
  rent: "bg-blue-100 text-blue-700",
  utilities: "bg-yellow-100 text-yellow-700",
  salaries: "bg-purple-100 text-purple-700",
  ingredients: "bg-green-100 text-green-700",
  supplies: "bg-orange-100 text-orange-700",
  marketing: "bg-pink-100 text-pink-700",
  maintenance: "bg-amber-100 text-amber-700",
  insurance: "bg-indigo-100 text-indigo-700",
  taxes: "bg-red-100 text-red-700",
  transport: "bg-teal-100 text-teal-700",
  packaging: "bg-cyan-100 text-cyan-700",
  cleaning: "bg-lime-100 text-lime-700",
  technology: "bg-violet-100 text-violet-700",
  other: "bg-gray-100 text-gray-700",
};

const PAYMENT_METHODS = ["cash", "card", "bank_transfer", "check", "other"];

export default function ExpensesPage() {
  const [expensesList, setExpensesList] = useState<Expense[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TExpenseSchema>({
    resolver: zodResolver(expenseSchema),
  });

  const watchedCategory = watch("category");
  const watchedPaymentMethod = watch("paymentMethod");
  const watchedBranchId = watch("branchId");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [expResult, branchResult] = await Promise.all([
        getExpenses({
          search: debouncedSearch || undefined,
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        }),
        getMyBranches(),
      ]);
      if (expResult.success) {
        setExpensesList(expResult.expenses as Expense[]);
      } else {
        toast.error(expResult.error || "Failed to load expenses");
      }
      if (branchResult.success) {
        setBranches(branchResult.branches as Branch[]);
      }
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categoryFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data: TExpenseSchema) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        branchId: data.branchId || undefined,
      };
      if (editingExpense) {
        const result = await updateExpense(editingExpense.id, payload);
        if (result.success) {
          toast.success("Expense updated successfully");
          setDialogOpen(false);
          setEditingExpense(null);
          fetchData();
        } else {
          toast.error(result.error || "Failed to update expense");
        }
      } else {
        const result = await createExpense(payload);
        if (result.success) {
          toast.success("Expense created successfully");
          setDialogOpen(false);
          fetchData();
        } else {
          toast.error(result.error || "Failed to create expense");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingExpense) return;
    setSubmitting(true);
    try {
      const result = await deleteExpense(deletingExpense.id);
      if (result.success) {
        toast.success("Expense deleted successfully");
        setDeleteDialogOpen(false);
        setDeletingExpense(null);
        fetchData();
      } else {
        toast.error(result.error || "Failed to delete expense");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateDialog = () => {
    setEditingExpense(null);
    reset({
      title: "",
      category: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "cash",
      description: "",
      branchId: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (expense: Expense, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingExpense(expense);
    reset({
      title: expense.title,
      category: expense.category,
      amount: parseFloat(expense.amount as string),
      date: expense.date,
      paymentMethod: expense.paymentMethod,
      description: expense.description || "",
      branchId: expense.branchId || "",
    });
    setDialogOpen(true);
  };

  const filteredExpenses = paymentFilter !== "all"
    ? expensesList.filter((e) => e.paymentMethod === paymentFilter)
    : expensesList;

  const totalExpenses = filteredExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount as string),
    0
  );

  const categoryBreakdown = filteredExpenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount as string);
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your business expenses
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          Add Expense
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <DollarSign className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Receipt className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{filteredExpenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Tag className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{Object.keys(categoryBreakdown).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Calendar className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg per Expense</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v ?? "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-40"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-40"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Loading expenses...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Receipt className="mb-2 size-8" />
                    <p className="text-sm font-medium">No expenses found</p>
                    <p className="text-xs">
                      {search || categoryFilter !== "all" || paymentFilter !== "all" || dateFrom || dateTo
                        ? "Try adjusting your filters"
                        : "Add your first expense to get started"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => {
                const branch = branches.find((b) => b.id === expense.branchId);
                return (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell>
                      <Badge className={CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other}>
                        {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(parseFloat(expense.amount as string))}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(expense.date)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {expense.paymentMethod.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {branch?.name || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" />}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => openEditDialog(expense, e)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingExpense(expense);
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

      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Category Breakdown</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([category, total]) => (
                <div key={category} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Badge className={CATEGORY_COLORS[category] || CATEGORY_COLORS.other}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(total)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" {...register("title")} placeholder="Monthly rent payment" />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={watchedCategory || ""}
                  onValueChange={(val) => setValue("category", val ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-xs text-destructive">{errors.amount.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && (
                  <p className="text-xs text-destructive">{errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={watchedPaymentMethod || "cash"}
                  onValueChange={(val) => setValue("paymentMethod", val ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchId">Branch</Label>
              <Select
                value={watchedBranchId || ""}
                onValueChange={(val) => setValue("branchId", val ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Additional notes about this expense..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingExpense ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <p className="text-sm">
              Are you sure you want to delete{" "}
              <strong>{deletingExpense?.title}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingExpense(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
