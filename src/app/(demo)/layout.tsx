"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  UtensilsCrossed,
  Coffee,
  Eye,
} from "lucide-react";

const demoNav = [
  { name: "Dashboard", href: "/demo/dashboard", icon: LayoutDashboard },
  { name: "POS", href: "/demo/pos", icon: ShoppingCart },
  { name: "Orders", href: "/demo/orders", icon: ClipboardList },
  { name: "Menu", href: "/demo/menu", icon: UtensilsCrossed },
];

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex flex-col h-full bg-card border-r w-56 shrink-0">
        <div className="flex items-center h-14 px-3 border-b shrink-0">
          <Link href="/demo/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <Coffee className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">RestoOS</span>
          </Link>
        </div>

        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-medium px-2.5 py-1.5 rounded-lg">
            <Eye className="w-3 h-3" /> Demo Mode — Read Only
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-1.5">
          <ul className="space-y-px">
            {demoNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t px-3 py-3 shrink-0 space-y-2">
          <Link
            href="/sign-up"
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
          >
            Get Started Free
          </Link>
          <Link
            href="/"
            className="w-full border border-border py-2 rounded-lg text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center"
          >
            Back to Home
          </Link>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center h-14 border-b bg-card px-4 shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <h2 className="text-sm font-medium">La Maison Dorée</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">Demo</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">MR</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
