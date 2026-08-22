"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    signOutAction().then(() => {
      router.push("/sign-in");
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing out...</p>
    </div>
  );
}
