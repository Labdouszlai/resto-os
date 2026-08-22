"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { employeeSchema } from "@/lib/validations";
import { z } from "zod";
type TEmployeeSchema = z.infer<typeof employeeSchema>;
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/app/actions/employees";
import { formatDate } from "@/lib/format";
import { ROLES } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import type { Employee, Branch } from "@/lib/db/schema";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { getMyBranches } from "@/app/actions/branch";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-700",
};

const EMPLOYEE_ROLES = [...ROLES] as const;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TEmployeeSchema>({
    resolver: zodResolver(employeeSchema),
  });

  const watchedRole = watch("role");
  const watchedStatus = watch("status");
  const watchedBranchId = watch("branchId");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [empResult, branchResult] = await Promise.all([
        getEmployees({
          search: debouncedSearch || undefined,
          role: roleFilter !== "all" ? roleFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
        getMyBranches(),
      ]);
      if (empResult.success) {
        setEmployees(empResult.employees as Employee[]);
      } else {
        toast.error(empResult.error || "Failed to load employees");
      }
      if (branchResult.success) {
        setBranches(branchResult.branches as Branch[]);
      }
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSubmit = async (data: TEmployeeSchema) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        branchId: data.branchId || undefined,
      };
      if (editingEmployee) {
        const result = await updateEmployee(editingEmployee.id, payload);
        if (result.success) {
          toast.success("Employee updated successfully");
          setDialogOpen(false);
          setEditingEmployee(null);
          fetchData();
        } else {
          toast.error(result.error || "Failed to update employee");
        }
      } else {
        const result = await createEmployee(payload);
        if (result.success) {
          toast.success("Employee created successfully");
          setDialogOpen(false);
          fetchData();
        } else {
          toast.error(result.error || "Failed to create employee");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEmployee) return;
    setSubmitting(true);
    try {
      const result = await deleteEmployee(deletingEmployee.id);
      if (result.success) {
        toast.success("Employee deleted successfully");
        setDeleteDialogOpen(false);
        setDeletingEmployee(null);
        fetchData();
      } else {
        toast.error(result.error || "Failed to delete employee");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateDialog = () => {
    setEditingEmployee(null);
    reset({
      name: "",
      email: "",
      phone: "",
      role: "",
      branchId: "",
      position: "",
      status: "active",
      hireDate: "",
      salary: undefined,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (employee: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEmployee(employee);
    reset({
      name: employee.name,
      email: employee.email || "",
      phone: employee.phone || "",
      role: employee.role,
      branchId: employee.branchId || "",
      position: employee.position || "",
      status: employee.status,
      hireDate: employee.hireDate || "",
      salary: employee.salary ? parseFloat(employee.salary as string) : undefined,
    });
    setDialogOpen(true);
  };

  const filteredEmployees = branchFilter !== "all"
    ? employees.filter((e) => e.branchId === branchFilter)
    : employees;

  const activeCount = filteredEmployees.filter((e) => e.status === "active").length;
  const inactiveCount = filteredEmployees.filter((e) => e.status === "inactive").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground">
            Manage your restaurant staff
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          Add Employee
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{filteredEmployees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <UserCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <UserX className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">{inactiveCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? "")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {EMPLOYEE_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={branchFilter} onValueChange={(v) => setBranchFilter(v ?? "")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    Loading employees...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Briefcase className="mb-2 size-8" />
                    <p className="text-sm font-medium">No employees found</p>
                    <p className="text-xs">
                      {search || roleFilter !== "all" || statusFilter !== "all" || branchFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Add your first employee to get started"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => {
                const branch = branches.find((b) => b.id === employee.branchId);
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {employee.email || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {employee.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {branch?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[employee.status] || "bg-gray-100 text-gray-700"}>
                        {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {employee.hireDate ? formatDate(employee.hireDate) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" />}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => openEditDialog(employee, e)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingEmployee(employee);
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Edit Employee" : "Add Employee"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} placeholder="John Doe" />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={watchedRole || ""}
                  onValueChange={(val) => setValue("role", val ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-destructive">{errors.role.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  {...register("position")}
                  placeholder="Head Chef"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watchedStatus || "active"}
                  onValueChange={(val) => setValue("status", val ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input id="hireDate" type="date" {...register("hireDate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  step="0.01"
                  {...register("salary", { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingEmployee ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <p className="text-sm">
              Are you sure you want to delete{" "}
              <strong>{deletingEmployee?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingEmployee(null);
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
