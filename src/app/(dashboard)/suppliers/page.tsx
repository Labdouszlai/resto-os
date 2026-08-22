"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supplierSchema } from "@/lib/validations";
import { z } from "zod";
type TSupplierSchema = z.infer<typeof supplierSchema>;
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/app/actions/suppliers";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Supplier } from "@/lib/db/schema";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Truck,
  Mail,
  Phone,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
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
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getSuppliers();
      if (result.success) {
        setSuppliers(result.suppliers as Supplier[]);
      } else {
        toast.error(result.error || "Failed to load suppliers");
      }
    } catch {
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const onSubmit = async (data: TSupplierSchema) => {
    setSubmitting(true);
    try {
      if (editingSupplier) {
        const result = await updateSupplier(editingSupplier.id, data);
        if (result.success) {
          toast.success("Supplier updated successfully");
          setDialogOpen(false);
          setEditingSupplier(null);
          fetchSuppliers();
        } else {
          toast.error(result.error || "Failed to update supplier");
        }
      } else {
        const result = await createSupplier(data);
        if (result.success) {
          toast.success("Supplier created successfully");
          setDialogOpen(false);
          fetchSuppliers();
        } else {
          toast.error(result.error || "Failed to create supplier");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    setSubmitting(true);
    try {
      const result = await deleteSupplier(deletingSupplier.id);
      if (result.success) {
        toast.success("Supplier deleted successfully");
        setDeleteDialogOpen(false);
        setDeletingSupplier(null);
        fetchSuppliers();
      } else {
        toast.error(result.error || "Failed to delete supplier");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateDialog = () => {
    setEditingSupplier(null);
    reset({ name: "", company: "", email: "", phone: "", address: "", notes: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (supplier: Supplier, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSupplier(supplier);
    reset({
      name: supplier.name,
      company: supplier.company || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      notes: supplier.notes || "",
    });
    setDialogOpen(true);
  };

  const filtered = suppliers.filter((s) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.company && s.company.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your suppliers and vendors
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          Add Supplier
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <Truck className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Suppliers</p>
              <p className="text-2xl font-bold">{suppliers.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
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
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Loading suppliers...
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Truck className="mb-2 size-8" />
                    <p className="text-sm font-medium">No suppliers found</p>
                    <p className="text-xs">
                      {search ? "Try a different search" : "Add your first supplier"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/suppliers/${supplier.id}`)}
                >
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {supplier.company || (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                        <Building2 className="size-3" /> —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {supplier.email || (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                        <Mail className="size-3" /> —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {supplier.phone || (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                        <Phone className="size-3" /> —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(supplier.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" />}
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => openEditDialog(supplier, e)}>
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingSupplier(supplier);
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Edit Supplier" : "Add Supplier"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} placeholder="John Smith" />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" {...register("company")} placeholder="Fresh Produce Co." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="supplier@company.com" />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} placeholder="456 Supply Rd, City" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register("notes")} placeholder="Any notes..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingSupplier ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Supplier</DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <p className="text-sm">
              Are you sure you want to delete{" "}
              <strong>{deletingSupplier?.name}</strong>? This action cannot be undone.
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
