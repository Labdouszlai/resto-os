"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Coffee, ArrowRight, Eye, ShoppingCart, BarChart3, Package, Users, Clock, Loader2 } from "lucide-react";
import { demoLoginAction } from "@/app/actions/demo";

export default function DemoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDemoLogin() {
    setLoading(true);
    try {
      const result = await demoLoginAction();
      if (result.success) {
        toast.success("Welcome to the demo! Loading La Maison Dorée...");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Failed to start demo");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

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
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Try RestoOS instantly</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore a fully populated demo restaurant with realistic menu items, orders, inventory, customers, and reports. No signup required.
          </p>
        </div>

        <div className="border-2 border-primary/20 rounded-2xl p-8 bg-card mb-12 shadow-lg shadow-primary/5">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-4">
              <Coffee className="w-4 h-4" /> La Maison Dorée
            </div>
            <h2 className="text-xl font-semibold">One-Click Demo</h2>
            <p className="text-sm text-muted-foreground mt-1">Jump straight into a fully set up restaurant</p>
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Setting up demo...
              </>
            ) : (
              <>
                Launch Demo <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Includes 26 menu items, 120 orders, 30 customers, 15 employees, inventory, and more
            </p>
          </div>
        </div>

        <div className="border rounded-2xl p-6 bg-card/50 mb-12">
          <h3 className="font-medium text-sm mb-3 text-muted-foreground">Or sign in manually</h3>
          <div className="bg-muted/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Email</span>
                <code className="block font-mono bg-background px-3 py-1.5 rounded-lg border mt-1">demo@restoos.com</code>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Password</span>
                <code className="block font-mono bg-background px-3 py-1.5 rounded-lg border mt-1">demo1234</code>
              </div>
            </div>
            <Link href="/sign-in" className="border border-border px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors text-center whitespace-nowrap">
              Sign in
            </Link>
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">What you will explore</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: <BarChart3 className="w-5 h-5" />, title: "Dashboard", desc: "Revenue charts, order trends, top-selling items, and key metrics at a glance." },
            { icon: <ShoppingCart className="w-5 h-5" />, title: "Point of Sale", desc: "Create orders, assign tables, add modifiers, and process payments." },
            { icon: <Package className="w-5 h-5" />, title: "Inventory", desc: "Track ingredients, stock levels, supplier management, and purchase orders." },
            { icon: <Users className="w-5 h-5" />, title: "Team & Customers", desc: "15 employees with roles, 30 customers with order history." },
            { icon: <Clock className="w-5 h-5" />, title: "Reservations", desc: "Table assignments, party sizes, and reservation management." },
            { icon: <Coffee className="w-5 h-5" />, title: "Reports", desc: "Revenue, expenses, menu performance, and employee analytics." },
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
