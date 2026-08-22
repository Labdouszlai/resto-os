"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Store,
  GitBranch,
  User,
  Plus,
  Pencil,
  Trash2,
  Save,
  Building2,
  Shield,
} from "lucide-react";
import {
  getSettingsData,
  updateRestaurantSettings,
  createBranchAction,
  updateBranchAction,
  deleteBranchAction,
  updateProfileAction,
  changePasswordAction,
} from "./actions";
import { toast } from "sonner";

const restaurantFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  taxRate: z.number().min(0).max(100).optional(),
});

const branchFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
});

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RestaurantFormData = z.infer<typeof restaurantFormSchema>;
type BranchFormData = z.infer<typeof branchFormSchema>;
type ProfileFormData = z.infer<typeof profileFormSchema>;
type PasswordFormData = z.infer<typeof passwordFormSchema>;

interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
}

interface RestaurantData {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  currency: string;
  taxRate: string;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("restaurant");
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [deleteBranchDialogOpen, setDeleteBranchDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const restaurantForm = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      currency: "USD",
      taxRate: 0,
    },
  });

  const branchForm = useForm<BranchFormData>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: { name: "", address: "", phone: "" },
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "", email: "" },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const loadData = useCallback(async () => {
    try {
      const result = await getSettingsData();
      if (result.success) {
        if (result.restaurant) {
          const r = result.restaurant;
          setRestaurant(r);
          restaurantForm.reset({
            name: r.name,
            phone: r.phone || "",
            email: r.email || "",
            address: r.address || "",
            currency: r.currency || "USD",
            taxRate: parseFloat(r.taxRate || "0"),
          });
        }
        if (result.branches) setBranches(result.branches);
        if (result.user) {
          setProfile(result.user);
          profileForm.reset({ name: result.user.name, email: result.user.email });
        }
      } else {
        toast.error(result.error || "Failed to load settings");
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [restaurantForm, profileForm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRestaurantSubmit = async (data: RestaurantFormData) => {
    setIsSubmitting(true);
    try {
      const res = await updateRestaurantSettings({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address,
        currency: data.currency,
        taxRate: data.taxRate,
      });
      if (res.success) {
        toast.success("Restaurant settings updated");
        if (res.restaurant) setRestaurant(res.restaurant);
      } else {
        toast.error(res.error || "Failed to update settings");
      }
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBranchSubmit = async (data: BranchFormData) => {
    setIsSubmitting(true);
    try {
      if (editingBranch) {
        const res = await updateBranchAction(editingBranch.id, {
          name: data.name,
          address: data.address,
          phone: data.phone,
        });
        if (res.success) {
          toast.success("Branch updated");
          loadData();
          setBranchDialogOpen(false);
        } else {
          toast.error(res.error || "Failed to update branch");
        }
      } else {
        const res = await createBranchAction({
          name: data.name,
          address: data.address,
          phone: data.phone,
        });
        if (res.success) {
          toast.success("Branch created");
          loadData();
          setBranchDialogOpen(false);
        } else {
          toast.error(res.error || "Failed to create branch");
        }
      }
    } catch {
      toast.error("Failed to save branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBranch = async () => {
    if (!editingBranch) return;
    setIsSubmitting(true);
    try {
      const res = await deleteBranchAction(editingBranch.id);
      if (res.success) {
        toast.success("Branch deleted");
        loadData();
        setDeleteBranchDialogOpen(false);
      } else {
        toast.error(res.error || "Failed to delete branch");
      }
    } catch {
      toast.error("Failed to delete branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const res = await updateProfileAction({
        name: data.name,
        email: data.email,
      });
      if (res.success) {
        toast.success("Profile updated");
        if (res.user) setProfile(res.user);
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    try {
      const res = await changePasswordAction(
        data.currentPassword,
        data.newPassword
      );
      if (res.success) {
        toast.success("Password changed successfully");
        passwordForm.reset();
      } else {
        toast.error(res.error || "Failed to change password");
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBranch = async (branch: Branch) => {
    try {
      const res = await updateBranchAction(branch.id, {
        isActive: !branch.isActive,
      });
      if (res.success) {
        setBranches((prev) =>
          prev.map((b) =>
            b.id === branch.id ? { ...b, isActive: !b.isActive } : b
          )
        );
        toast.success(
          `Branch ${branch.isActive ? "deactivated" : "activated"}`
        );
      }
    } catch {
      toast.error("Failed to update branch");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your restaurant configuration
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(v)}>
        <TabsList variant="line">
          <TabsTrigger value="restaurant">
            <Store className="size-4" />
            Restaurant
          </TabsTrigger>
          <TabsTrigger value="branches">
            <GitBranch className="size-4" />
            Branches
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="size-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="restaurant">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
              <CardDescription>
                Update your restaurant details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={restaurantForm.handleSubmit(handleRestaurantSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Restaurant Name</Label>
                    <Input
                      {...restaurantForm.register("name")}
                      placeholder="My Restaurant"
                    />
                    {restaurantForm.formState.errors.name && (
                      <p className="text-xs text-destructive">
                        {restaurantForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      {...restaurantForm.register("phone")}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      {...restaurantForm.register("email")}
                      placeholder="info@restaurant.com"
                    />
                    {restaurantForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {restaurantForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      {...restaurantForm.register("address")}
                      placeholder="123 Main St, City"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={restaurantForm.watch("currency")}
                      onValueChange={(v) =>
                        v && restaurantForm.setValue("currency", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="PHP">PHP (₱)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...restaurantForm.register("taxRate", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="size-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Branches</CardTitle>
                  <CardDescription>
                    Manage your restaurant locations
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingBranch(null);
                    branchForm.reset({ name: "", address: "", phone: "" });
                    setBranchDialogOpen(true);
                  }}
                >
                  <Plus className="size-4" />
                  Add Branch
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {branches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Building2 className="mb-2 size-8" />
                  <p className="text-sm">No branches configured</p>
                  <p className="text-xs">Add a branch to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">
                          {branch.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {branch.address || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {branch.phone || "—"}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleToggleBranch(branch)}
                            className="cursor-pointer"
                          >
                            <Badge
                              variant={branch.isActive ? "default" : "outline"}
                              className={
                                branch.isActive
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "text-muted-foreground"
                              }
                            >
                              {branch.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setEditingBranch(branch);
                                branchForm.reset({
                                  name: branch.name,
                                  address: branch.address || "",
                                  phone: branch.phone || "",
                                });
                                setBranchDialogOpen(true);
                              }}
                            >
                              <Pencil className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setEditingBranch(branch);
                                setDeleteBranchDialogOpen(true);
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

        <TabsContent value="profile">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        {...profileForm.register("name")}
                        placeholder="John Doe"
                      />
                      {profileForm.formState.errors.name && (
                        <p className="text-xs text-destructive">
                          {profileForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        {...profileForm.register("email")}
                        placeholder="john@example.com"
                      />
                      {profileForm.formState.errors.email && (
                        <p className="text-xs text-destructive">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="size-4" />
                      Update Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      {...passwordForm.register("currentPassword")}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-xs text-destructive">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        {...passwordForm.register("newPassword")}
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-xs text-destructive">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        {...passwordForm.register("confirmPassword")}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-destructive">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      <Shield className="size-4" />
                      Change Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? "Edit Branch" : "Add Branch"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={branchForm.handleSubmit(handleBranchSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input
                {...branchForm.register("name")}
                placeholder="e.g. Downtown Location"
              />
              {branchForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {branchForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                {...branchForm.register("address")}
                placeholder="123 Main St"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                {...branchForm.register("phone")}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBranchDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {editingBranch ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteBranchDialogOpen}
        onOpenChange={setDeleteBranchDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Branch</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &quot;{editingBranch?.name}&quot;?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteBranchDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBranch}
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
