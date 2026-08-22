"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Plus,
  Pencil,
  Trash2,
  Users,
  LayoutGrid,
} from "lucide-react";
import {
  TABLE_STATUS_LABELS,
  TABLE_STATUS_COLORS,
  TableStatus,
} from "@/lib/format";
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
} from "@/app/actions/tables";
import { toast } from "sonner";

interface TableItem {
  id: string;
  number: string;
  capacity: number;
  status: string;
  branchId: string;
}

export default function TablesPage() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [tableCapacity, setTableCapacity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadTables() {
    try {
      const res = await getTables();
      if (res.success) setTables(res.tables);
    } catch {
      toast.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTables();
  }, []);

  const handleCreate = () => {
    setEditingTable(null);
    setTableNumber("");
    setTableCapacity("");
    setDialogOpen(true);
  };

  const handleEdit = (table: TableItem) => {
    setEditingTable(table);
    setTableNumber(table.number);
    setTableCapacity(table.capacity.toString());
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!tableNumber || !tableCapacity) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTable) {
        const res = await updateTable(editingTable.id, {
          number: parseInt(tableNumber),
          capacity: parseInt(tableCapacity),
        });
        if (res.success) {
          toast.success("Table updated");
          setTables((prev) =>
            prev.map((t) =>
              t.id === editingTable.id
                ? { ...t, number: tableNumber, capacity: parseInt(tableCapacity) }
                : t
            )
          );
        } else {
          toast.error(res.error || "Failed to update table");
        }
      } else {
        const res = await createTable({
          number: parseInt(tableNumber),
          capacity: parseInt(tableCapacity),
          branchId: "",
        });
        if (res.success) {
          toast.success("Table created");
          setTables((prev) => [...prev, res.table!]);
        } else {
          toast.error(res.error || "Failed to create table");
        }
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save table");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingTable) return;

    setIsSubmitting(true);
    try {
      const res = await deleteTable(editingTable.id);
      if (res.success) {
        toast.success("Table deleted");
        setTables((prev) => prev.filter((t) => t.id !== editingTable.id));
        setDeleteDialogOpen(false);
      } else {
        toast.error(res.error || "Failed to delete table");
      }
    } catch {
      toast.error("Failed to delete table");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (tableId: string, status: string) => {
    try {
      const res = await updateTableStatus(tableId, status);
      if (res.success) {
        setTables((prev) =>
          prev.map((t) => (t.id === tableId ? { ...t, status } : t))
        );
        toast.success("Table status updated");
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const statusCounts = tables.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading tables...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Table Management</h1>
          <p className="text-sm text-muted-foreground">
            {tables.length} tables total
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="size-4" />
          Add Table
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(TABLE_STATUS_LABELS).map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <div
              className={`size-3 rounded-full ${
                TABLE_STATUS_COLORS[status as TableStatus]?.split(" ")[0]
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {label}: {statusCounts[status] || 0}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {tables.map((table) => (
          <Card
            key={table.id}
            className={`cursor-pointer transition-colors hover:ring-2 hover:ring-primary/50 ${
              TABLE_STATUS_COLORS[table.status as TableStatus]?.split(" ")[2] || ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold">T{table.number}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="size-3" />
                    {table.capacity} seats
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={TABLE_STATUS_COLORS[table.status as TableStatus]}
                >
                  {TABLE_STATUS_LABELS[table.status as TableStatus]}
                </Badge>
              </div>
              <div className="mt-3 flex gap-1">
                <Select
                  value={table.status}
                  onValueChange={(v) => v && handleStatusChange(table.id, v)}
                >
                  <SelectTrigger className="h-7 text-xs" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TABLE_STATUS_LABELS).map(([s, l]) => (
                      <SelectItem key={s} value={s}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(table);
                  }}
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTable(table);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="size-3 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <LayoutGrid className="mb-2 size-8" />
          <p className="text-sm">No tables configured</p>
          <p className="text-xs">Add a table to get started</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTable ? "Edit Table" : "Add Table"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Table Number</Label>
              <Input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input
                type="number"
                value={tableCapacity}
                onChange={(e) => setTableCapacity(e.target.value)}
                placeholder="e.g. 4"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {editingTable ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Table</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete Table {editingTable?.number}? This
            action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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
