"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  UtensilsCrossed,
  CreditCard,
  Banknote,
  ArrowRight,
  Clock,
} from "lucide-react";
import { formatCurrency, toNumber } from "@/lib/format";
import { createOrder } from "@/app/actions/orders";
import { getTables } from "@/app/actions/tables";
import { getMenuItems } from "@/app/actions/menu";
import { getCategories } from "@/app/actions/menu";
import { toast } from "sonner";

interface CartItemModifier {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  modifiers: CartItemModifier[];
}

interface MenuCategory {
  id: string;
  name: string;
}

interface MenuItemOption {
  id: string;
  name: string;
  price: string | number;
  isAvailable: boolean;
  image: string | null;
  categoryId?: string;
  modifiers?: { modifier: { id: string; name: string; price: string | number } }[];
}

interface TableOption {
  id: string;
  number: string;
  capacity: number;
  status: string;
}

export default function POSPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemOption[]>([]);
  const [tables, setTables] = useState<TableOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [orderType, setOrderType] = useState<string>("dine-in");
  const [notes, setNotes] = useState("");
  const [modifierDialogOpen, setModifierDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [currentItemForModifiers, setCurrentItemForModifiers] = useState<MenuItemOption | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<CartItemModifier[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, itemRes, tableRes] = await Promise.all([
          getCategories(),
          getMenuItems(),
          getTables(),
        ]);
        if (catRes.success) setCategories(catRes.categories);
        if (itemRes.success) setMenuItems(itemRes.items);
        if (tableRes.success) setTables(tableRes.tables);
      } catch {
        toast.error("Failed to load POS data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" ||
      item.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable;
  });

  const addToCart = useCallback((item: MenuItemOption) => {
    if (item.modifiers && item.modifiers.length > 0) {
      setCurrentItemForModifiers(item);
      setSelectedModifiers([]);
      setModifierDialogOpen(true);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: toNumber(item.price),
          quantity: 1,
          notes: "",
          modifiers: [],
        },
      ];
    });
  }, []);

  const confirmAddWithModifiers = useCallback(() => {
    if (!currentItemForModifiers) return;

    setCart((prev) => {
      const existing = prev.find(
        (c) =>
          c.id === currentItemForModifiers.id &&
          JSON.stringify(c.modifiers) === JSON.stringify(selectedModifiers)
      );
      if (existing) {
        return prev.map((c) =>
          c === existing ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          id: currentItemForModifiers.id,
          name: currentItemForModifiers.name,
          price: toNumber(currentItemForModifiers.price),
          quantity: 1,
          notes: "",
          modifiers: selectedModifiers,
        },
      ];
    });

    setModifierDialogOpen(false);
    setCurrentItemForModifiers(null);
    setSelectedModifiers([]);
  }, [currentItemForModifiers, selectedModifiers]);

  const updateQuantity = useCallback((index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      (item.price + item.modifiers.reduce((mSum, m) => mSum + m.price, 0)) *
        item.quantity,
    0
  );
  const taxRate = 0.1;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (orderType === "dine-in" && !selectedTable) {
      toast.error("Please select a table");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createOrder({
        type: orderType,
        tableId: orderType === "dine-in" ? selectedTable : undefined,
        notes,
        items: cart.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
          modifiers: item.modifiers.map((m) => m.id),
        })),
      });

      if (result.success) {
        toast.success("Order created successfully");
        setCart([]);
        setNotes("");
        setPaymentDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to create order");
      }
    } catch {
      toast.error("Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading POS...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">POS</h1>
          <Select value={orderType} onValueChange={(v) => v && setOrderType(v)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dine-in">Dine-in</SelectItem>
              <SelectItem value="takeaway">Takeaway</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
            </SelectContent>
          </Select>
          {orderType === "dine-in" && (
            <Select value={selectedTable} onValueChange={(v) => v && setSelectedTable(v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Table" />
              </SelectTrigger>
              <SelectContent>
                {tables
                  .filter((t) => t.status === "available")
                  .map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      T{table.number} ({table.capacity})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShoppingCart className="size-4" />
          {cart.length} items
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden border-r">
          <div className="flex items-center gap-2 border-b px-4 py-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto border-b px-4 py-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="group flex flex-col rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent"
                >
                  <div className="mb-2 flex aspect-square items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <UtensilsCrossed className="size-8" />
                  </div>
                  <div className="text-sm font-medium leading-tight group-hover:text-primary">
                    {item.name}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-primary">
                    {formatCurrency(toNumber(item.price))}
                  </div>
                </button>
              ))}
            </div>
            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <UtensilsCrossed className="mb-2 size-8" />
                <p className="text-sm">No items found</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-80 flex-col bg-background lg:w-96">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold">Current Order</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShoppingCart className="mb-2 size-8" />
                <p className="text-sm">Cart is empty</p>
                <p className="text-xs">Add items from the menu</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="rounded-lg border p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.name}</div>
                        {item.modifiers.length > 0 && (
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {item.modifiers.map((m) => m.name).join(", ")}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="rounded border p-0.5 hover:bg-muted"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="rounded border p-0.5 hover:bg-muted"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatCurrency(
                          (item.price +
                            item.modifiers.reduce((s, m) => s + m.price, 0)) *
                            item.quantity
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t px-4 py-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <Input
              placeholder="Order notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
            />
            <Button
              onClick={() => setPaymentDialogOpen(true)}
              disabled={cart.length === 0 || isSubmitting}
              className="mt-2 w-full"
              size="lg"
            >
              <CreditCard className="size-4" />
              Pay {formatCurrency(total)}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={modifierDialogOpen} onOpenChange={setModifierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add modifiers for {currentItemForModifiers?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {currentItemForModifiers?.modifiers?.map((m) => (
              <label
                key={m.modifier.id}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent"
              >
                <input
                  type="checkbox"
                  checked={selectedModifiers.some((s) => s.id === m.modifier.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedModifiers((prev) => [
                        ...prev,
                        {
                          id: m.modifier.id,
                          name: m.modifier.name,
                          price: toNumber(m.modifier.price),
                        },
                      ]);
                    } else {
                      setSelectedModifiers((prev) =>
                        prev.filter((s) => s.id !== m.modifier.id)
                      );
                    }
                  }}
                  className="size-4"
                />
                <span className="flex-1 text-sm">{m.modifier.name}</span>
                <span className="text-sm text-muted-foreground">
                  +{formatCurrency(toNumber(m.modifier.price))}
                </span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModifierDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmAddWithModifiers}>Add to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">{formatCurrency(total)}</div>
              </div>
            </div>
            <div className="text-sm font-medium">Payment Method</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "cash", label: "Cash", icon: Banknote },
                { value: "card", label: "Card", icon: CreditCard },
                { value: "other", label: "Other", icon: ArrowRight },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                    paymentMethod === value
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                >
                  <Icon className="size-6" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Clock className="size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="size-4" />
                  Confirm Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
