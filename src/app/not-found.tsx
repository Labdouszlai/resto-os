"use client";

import Link from "next/link";
import { Coffee } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="bg-primary/10 text-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Coffee className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90">
            Back to home
          </Link>
          <Link href="/sign-in" className="border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
