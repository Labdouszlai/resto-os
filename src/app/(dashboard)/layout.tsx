import { getSessionOrNull } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getSessionOrNull();

  if (!ctx?.user) {
    redirect("/sign-in");
  }

  return (
    <DashboardLayoutClient
      restaurantName={ctx.restaurant?.name}
      userName={ctx.user.name}
      userImage={ctx.user.image ?? undefined}
    >
      {children}
    </DashboardLayoutClient>
  );
}
