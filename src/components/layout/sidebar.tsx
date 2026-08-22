"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Square,
  Calendar,
  UtensilsCrossed,
  Users,
  Package,
  Truck,
  Receipt,
  Wallet,
  UserCog,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS", href: "/pos", icon: ShoppingCart },
  { name: "Orders", href: "/orders", icon: ClipboardList },
  { name: "Tables", href: "/tables", icon: Square },
  { name: "Reservations", href: "/reservations", icon: Calendar },
  { name: "Menu", href: "/menu", icon: UtensilsCrossed },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Suppliers", href: "/suppliers", icon: Truck },
  { name: "Purchases", href: "/purchases", icon: Receipt },
  { name: "Expenses", href: "/expenses", icon: Wallet },
  { name: "Employees", href: "/employees", icon: UserCog },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-card border-r transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex items-center h-14 px-3 border-b shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground truncate tracking-tight">
              RestoOS
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-1.5">
        <ul className="space-y-px">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {onToggle && (
        <div className="border-t px-2 py-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full text-muted-foreground",
              collapsed ? "justify-center px-0" : "justify-start gap-2"
            )}
            onClick={onToggle}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </Button>
        </div>
      )}
    </aside>
  );
}
