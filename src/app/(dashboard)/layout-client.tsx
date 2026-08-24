"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  restaurantName?: string;
  userName?: string;
  userImage?: string;
}

export default function DashboardLayoutClient({
  children,
  restaurantName,
  userName,
  userImage,
}: DashboardLayoutClientProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar
          restaurantName={restaurantName || "RestoOS"}
          userName={userName || "User"}
          userImage={userImage}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
