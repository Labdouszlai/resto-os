"use client";

import { useState } from "react";

const categories = [
  { name: "Appetizers", items: [
    { name: "Bruschetta", price: 8.99 },
    { name: "Calamari Fritti", price: 12.99 },
    { name: "Caprese Salad", price: 10.99 },
    { name: "Garlic Bread", price: 5.99 },
  ]},
  { name: "Pasta", items: [
    { name: "Spaghetti Carbonara", price: 16.99 },
    { name: "Fettuccine Alfredo", price: 14.99 },
    { name: "Penne Arrabbiata", price: 13.99 },
    { name: "Lasagna Bolognese", price: 18.99 },
  ]},
  { name: "Pizza", items: [
    { name: "Margherita Pizza", price: 14.99 },
    { name: "Pepperoni Pizza", price: 16.99 },
    { name: "Quattro Formaggi", price: 17.99 },
  ]},
  { name: "Mains", items: [
    { name: "Chicken Parmigiana", price: 19.99 },
    { name: "Osso Buco", price: 28.99 },
    { name: "Grilled Salmon", price: 24.99 },
  ]},
  { name: "Desserts", items: [
    { name: "Tiramisu", price: 8.99 },
    { name: "Panna Cotta", price: 7.99 },
    { name: "Cannoli", price: 6.99 },
  ]},
  { name: "Drinks", items: [
    { name: "House Red Wine", price: 9.99 },
    { name: "Espresso", price: 3.99 },
    { name: "Sparkling Water", price: 4.99 },
  ]},
];

interface CartItem {
  name: string;
  price: number;
  qty: number;
}

export default function DemoPOSPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);

  function addToCart(name: string, price: number) {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === name);
      if (existing) return prev.map((i) => i.name === name ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { name, price, qty: 1 }];
    });
  }

  function removeFromCart(name: string) {
    setCart((prev) => prev.filter((i) => i.name !== name));
  }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Point of Sale</h1>
        <p className="text-sm text-muted-foreground mt-1">Table T4 — Dine-in</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setActiveCategory(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories[activeCategory].items.map((item) => (
              <button
                key={item.name}
                onClick={() => addToCart(item.name, item.price)}
                className="border rounded-xl p-4 text-left bg-card hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-lg font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="border rounded-xl bg-card p-4 h-fit sticky top-20">
          <h3 className="font-semibold text-sm mb-3">Current Order</h3>
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Click items to add to order</p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.name} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.qty} × ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-medium">${(item.price * item.qty).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.name)} className="text-xs text-muted-foreground hover:text-destructive">×</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-bold pt-1"><span>Total</span><span className="text-primary">${total.toFixed(2)}</span></div>
              </div>
              <button className="w-full mt-4 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
                Complete Order
              </button>
            </>
          )}
          <p className="text-[10px] text-muted-foreground text-center mt-3">Demo — orders are not saved</p>
        </div>
      </div>
    </div>
  );
}
