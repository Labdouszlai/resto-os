"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  CheckCircle2,
  Ban,
  Armchair,
} from "lucide-react";
import {
  getReservations,
  createReservation,
  updateReservation,
  cancelReservation,
  seatReservation,
  completeReservation,
} from "@/app/actions/reservations";
import { getCustomers } from "@/app/actions/customers";
import { getTables } from "@/app/actions/tables";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  parseISO,
} from "date-fns";

const reservationFormSchema = z.object({
  customerId: z.string().optional(),
  tableId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  partySize: z.number().min(1, "Party size must be at least 1"),
  notes: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationFormSchema>;

const RESERVATION_STATUSES = [
  "all",
  "pending",
  "confirmed",
  "seated",
  "completed",
  "cancelled",
  "no_show",
] as const;

const STATUS_LABELS: Record<string, string> = {
  all: "All",
  pending: "Pending",
  confirmed: "Confirmed",
  seated: "Seated",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  seated: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-gray-100 text-gray-700",
};

interface Reservation {
  id: string;
  date: string;
  time: string;
  partySize: number;
  status: string;
  notes: string | null;
  customerId: string | null;
  tableId: string | null;
  customer: { id: string; name: string; phone: string | null } | null;
  table: { id: string; number: string; capacity: number } | null;
}

interface Customer {
  id: string;
  name: string;
}

interface TableItem {
  id: string;
  number: string;
  capacity: number;
  status: string;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weekEnd = useMemo(
    () => endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
    [currentWeekStart]
  );

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      customerId: "",
      tableId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "19:00",
      partySize: 2,
      notes: "",
    },
  });

  const editForm = useForm<ReservationFormData>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      customerId: "",
      tableId: "",
      date: "",
      time: "",
      partySize: 2,
      notes: "",
    },
  });

  const loadData = useCallback(async () => {
    try {
      const dateFrom = format(currentWeekStart, "yyyy-MM-dd");
      const dateTo = format(weekEnd, "yyyy-MM-dd");
      const [resRes, custRes, tableRes] = await Promise.all([
        getReservations({ dateFrom, dateTo }),
        getCustomers(),
        getTables(),
      ]);
      if (resRes.success) setReservations(resRes.reservations);
      if (custRes.success) setCustomers(custRes.customers);
      if (tableRes.success) setTables(tableRes.tables);
    } catch {
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, [currentWeekStart, weekEnd]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredReservations = reservations.filter(
    (r) => statusFilter === "all" || r.status === statusFilter
  );

  const handleCreate = async (data: ReservationFormData) => {
    setIsSubmitting(true);
    try {
      const res = await createReservation({
        customerId: data.customerId || undefined,
        tableId: data.tableId || undefined,
        date: data.date,
        time: data.time,
        partySize: data.partySize,
        notes: data.notes,
      });
      if (res.success) {
        toast.success("Reservation created");
        loadData();
        setDialogOpen(false);
        form.reset();
      } else {
        toast.error(res.error || "Failed to create reservation");
      }
    } catch {
      toast.error("Failed to create reservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    editForm.reset({
      customerId: reservation.customerId || "",
      tableId: reservation.tableId || "",
      date: reservation.date,
      time: reservation.time,
      partySize: reservation.partySize,
      notes: reservation.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: ReservationFormData) => {
    if (!editingReservation) return;
    setIsSubmitting(true);
    try {
      const res = await updateReservation(editingReservation.id, {
        customerId: data.customerId || undefined,
        tableId: data.tableId || undefined,
        date: data.date,
        time: data.time,
        partySize: data.partySize,
        notes: data.notes,
      });
      if (res.success) {
        toast.success("Reservation updated");
        loadData();
        setEditDialogOpen(false);
      } else {
        toast.error(res.error || "Failed to update reservation");
      }
    } catch {
      toast.error("Failed to update reservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    reservationId: string,
    action: "confirm" | "seat" | "complete" | "cancel"
  ) => {
    try {
      let res;
      switch (action) {
        case "confirm":
          res = await updateReservation(reservationId, { status: "confirmed" });
          break;
        case "seat":
          res = await seatReservation(reservationId);
          break;
        case "complete":
          res = await completeReservation(reservationId);
          break;
        case "cancel":
          res = await cancelReservation(reservationId);
          break;
      }
      if (res?.success) {
        toast.success(`Reservation ${action === "confirm" ? "confirmed" : action === "seat" ? "seated" : action === "complete" ? "completed" : "cancelled"}`);
        loadData();
      } else {
        toast.error(res?.error || "Failed to update reservation");
      }
    } catch {
      toast.error("Failed to update reservation");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading reservations...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reservations</h1>
          <p className="text-sm text-muted-foreground">
            {reservations.length} reservations this week
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          New Reservation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Week of {format(currentWeekStart, "MMM d")} –{" "}
              {format(weekEnd, "MMM d, yyyy")}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  setCurrentWeekStart((prev) => subWeeks(prev, 1))
                }
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentWeekStart(
                    startOfWeek(new Date(), { weekStartsOn: 1 })
                  )
                }
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  setCurrentWeekStart((prev) => addWeeks(prev, 1))
                }
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
        <TabsList variant="line">
          {RESERVATION_STATUSES.map((status) => (
            <TabsTrigger key={status} value={status}>
              {STATUS_LABELS[status]}
              {status !== "all" && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {reservations.filter((r) => r.status === status).length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={statusFilter}>
          <Card>
            <CardContent className="p-0">
              {filteredReservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Calendar className="mb-2 size-8" />
                  <p className="text-sm">No reservations found</p>
                  <p className="text-xs">
                    {statusFilter === "all"
                      ? "No reservations for this week"
                      : `No ${STATUS_LABELS[statusFilter]?.toLowerCase()} reservations`}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-center">Party</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {reservation.customer?.name || "Walk-in"}
                            </div>
                            {reservation.customer?.phone && (
                              <div className="text-xs text-muted-foreground">
                                {reservation.customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(reservation.date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="size-3 text-muted-foreground" />
                            {reservation.time}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="size-3 text-muted-foreground" />
                            {reservation.partySize}
                          </div>
                        </TableCell>
                        <TableCell>
                          {reservation.table ? (
                            <Badge variant="secondary">
                              T{reservation.table.number}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              Any
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={STATUS_COLORS[reservation.status] || ""}
                          >
                            {STATUS_LABELS[reservation.status] || reservation.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {reservation.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  title="Confirm"
                                  onClick={() =>
                                    handleStatusChange(reservation.id, "confirm")
                                  }
                                >
                                  <CheckCircle2 className="size-3 text-blue-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  title="Cancel"
                                  onClick={() =>
                                    handleStatusChange(reservation.id, "cancel")
                                  }
                                >
                                  <Ban className="size-3 text-red-600" />
                                </Button>
                              </>
                            )}
                            {reservation.status === "confirmed" && (
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                title="Seat"
                                onClick={() =>
                                  handleStatusChange(reservation.id, "seat")
                                }
                              >
                                <Armchair className="size-3 text-green-600" />
                              </Button>
                            )}
                            {reservation.status === "seated" && (
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                title="Complete"
                                onClick={() =>
                                  handleStatusChange(reservation.id, "complete")
                                }
                              >
                                <CheckCircle2 className="size-3 text-emerald-600" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleEdit(reservation)}
                            >
                              <Pencil className="size-3" />
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
            <DialogTitle>New Reservation</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleCreate)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select
                value={form.watch("customerId")}
                onValueChange={(v) => form.setValue("customerId", v || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...form.register("date")} />
                {form.formState.errors.date && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" {...form.register("time")} />
                {form.formState.errors.time && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.time.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Party Size</Label>
                <Input
                  type="number"
                  min="1"
                  {...form.register("partySize", { valueAsNumber: true })}
                />
                {form.formState.errors.partySize && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.partySize.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Table</Label>
                <Select
                  value={form.watch("tableId")}
                  onValueChange={(v) => form.setValue("tableId", v || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables
                      .filter((t) => t.status === "available")
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          Table {t.number} ({t.capacity} seats)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                {...form.register("notes")}
                placeholder="Special requests, allergies..."
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
                Create Reservation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(handleEditSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select
                value={editForm.watch("customerId")}
                onValueChange={(v) => editForm.setValue("customerId", v || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...editForm.register("date")} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" {...editForm.register("time")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Party Size</Label>
                <Input
                  type="number"
                  min="1"
                  {...editForm.register("partySize", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Table</Label>
                <Select
                  value={editForm.watch("tableId")}
                  onValueChange={(v) => editForm.setValue("tableId", v || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        Table {t.number} ({t.capacity} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                {...editForm.register("notes")}
                placeholder="Special requests..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Update Reservation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
