"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, ChevronDown, LogOut, User, Settings, Command } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { SearchDialog } from "./search-dialog";
import { NotificationPanel } from "./notification-panel";
import { signOutAction } from "@/app/actions/auth";

interface TopbarProps {
  restaurantName?: string;
  userName?: string;
  userImage?: string;
}

export function Topbar({ restaurantName = "My Restaurant", userName, userImage }: TopbarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOutAction();
    router.push("/sign-in");
  }

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <>
      <SearchDialog />
      <header className="flex items-center h-14 border-b bg-card px-4 shrink-0">
        <div className="flex items-center gap-3 flex-1">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon-sm" className="lg:hidden" />}
            >
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-60">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {restaurantName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-1.5"
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline text-xs text-muted-foreground">
              <Command className="inline h-3 w-3" /> K
            </span>
            <span className="sr-only">Search</span>
          </Button>

          <NotificationPanel />

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="gap-2 ml-1" />
              }
            >
              <Avatar size="sm">
                {userImage && <AvatarImage src={userImage} alt={userName || ""} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{userName || "User"}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <User className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} variant="destructive">
                <LogOut className="w-4 h-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
