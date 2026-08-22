"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  restaurantName?: string;
  userName?: string;
  userImage?: string;
}

export default function DashboardLayout({
  children,
  restaurantName,
  userName,
  userImage,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar
          restaurantName={restaurantName}
          userName={userName}
          userImage={userImage}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
