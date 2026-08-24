"use client";

import Link from "next/link";
import { Coffee, ArrowRight, Eye, ShoppingCart, BarChart3, Package } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg"><Coffee className="w-5 h-5" /></div>
            <span className="text-lg font-bold tracking-tight">RestoOS</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/sign-in" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Sign in</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Eye className="w-3.5 h-3.5" /> Live Demo
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Try RestoOS with sample data</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore a fully populated demo restaurant with realistic menu items, orders, inventory, customers, and reports. See how RestoOS works before you sign up.
          </p>
        </div>

        <div className="border rounded-2xl p-8 bg-card mb-12">
          <h2 className="text-lg font-semibold mb-4">Demo Credentials</h2>
          <div className="bg-muted/50 rounded-xl p-6 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground w-20">Email:</span>
              <code className="text-sm font-mono bg-background px-3 py-1 rounded-lg border">demo@restoos.com</code>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground w-20">Password:</span>
              <code className="text-sm font-mono bg-background px-3 py-1 rounded-lg border">demo1234</code>
            </div>
          </div>
          <Link href="/sign-in" className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            Launch Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">What you will explore</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: <BarChart3 className="w-5 h-5" />, title: "Dashboard", desc: "Revenue charts, order trends, top-selling items, and key metrics at a glance." },
            { icon: <ShoppingCart className="w-5 h-5" />, title: "Point of Sale", desc: "Create orders, assign tables, add modifiers, and process payments." },
            { icon: <Package className="w-5 h-5" />, title: "Inventory", desc: "Track ingredients, stock levels, supplier management, and purchase orders." },
            { icon: <Coffee className="w-5 h-5" />, title: "Full Restaurant", desc: "Menu with categories and recipes, 30+ customers, 10 employees, reservations, and expenses." },
          ].map((item) => (
            <div key={item.title} className="border border-border/60 rounded-2xl p-6 hover:border-primary/30 transition-colors">
              <div className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center mb-4">{item.icon}</div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
