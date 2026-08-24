import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://restoos.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "RestoOS - Restaurant Management Platform",
    template: "%s | RestoOS",
  },
  description:
    "Complete restaurant management platform with POS, orders, inventory, menu, reservations, employees, and analytics. Run your restaurant from one place.",
  keywords: [
    "restaurant management",
    "restaurant POS",
    "point of sale",
    "inventory management",
    "order management",
    "reservation system",
    "restaurant software",
    "restaurant analytics",
  ],
  authors: [{ name: "RestoOS" }],
  creator: "RestoOS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "RestoOS",
    title: "RestoOS - Restaurant Management Platform",
    description:
      "Complete restaurant management platform with POS, orders, inventory, menu, reservations, employees, and analytics.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RestoOS - Restaurant Management Platform",
    description:
      "Complete restaurant management platform with POS, orders, inventory, menu, reservations, employees, and analytics.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
