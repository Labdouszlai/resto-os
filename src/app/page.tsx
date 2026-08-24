import Link from "next/link";
import {
  Coffee,
  ShoppingCart,
  ClipboardList,
  Package,
  UtensilsCrossed,
  Users,
  UserCheck,
  CalendarDays,
  BarChart3,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Moon,
} from "lucide-react";

const features = [
  {
    icon: <ShoppingCart className="w-6 h-6" />,
    title: "Point of Sale",
    description:
      "Fast, intuitive POS with table assignment, modifiers, split bills, and real-time order tracking.",
  },
  {
    icon: <ClipboardList className="w-6 h-6" />,
    title: "Orders",
    description:
      "Full order lifecycle from draft to completion. Filter by status, search by number, and manage every detail.",
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: "Inventory",
    description:
      "Track ingredients, stock levels, expiration dates, and automatic deductions when orders are placed.",
  },
  {
    icon: <UtensilsCrossed className="w-6 h-6" />,
    title: "Menu",
    description:
      "Organize menu items by categories, set pricing, recipes with ingredient mapping, and modifiers.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Employees",
    description:
      "Manage staff roles, positions, schedules, salaries, and performance across all your branches.",
  },
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: "Customers",
    description:
      "Build customer profiles, track order history, contact info, and notes for personalized service.",
  },
  {
    icon: <CalendarDays className="w-6 h-6" />,
    title: "Reservations",
    description:
      "Accept and manage reservations, assign tables, track party sizes, and handle special requests.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Reports",
    description:
      "Revenue, orders, menu performance, expenses, employee hours, and customer analytics — all in one place.",
  },
];

const stats = [
  { value: "26+", label: "Pages" },
  { value: "28", label: "Database Tables" },
  { value: "77+", label: "Server Actions" },
  { value: "7", label: "Roles" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Coffee className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">RestoOS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            Built for modern restaurants
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Run your restaurant
            <br />
            <span className="text-primary">from one place</span>
          </h1>
          <p className="text-muted-foreground text-lg mt-6 max-w-xl mx-auto leading-relaxed">
            Point of sale, orders, inventory, menu management, reservations,
            employees, and analytics — all in a single, beautiful platform.
          </p>
          <div className="flex items-center justify-center gap-3 mt-10">
            <Link
              href="/sign-up"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Start free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="border border-border px-6 py-3 rounded-xl font-medium text-sm hover:bg-muted transition-colors"
            >
              View demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            From taking orders to tracking inventory, RestoOS handles it all so
            you can focus on what matters — your food and your guests.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group border border-border/60 rounded-2xl p-6 hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300"
            >
              <div className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12">
          <div className="flex gap-4">
            <div className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Role-based access</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                7 roles with granular permissions. Owners, managers, chefs,
                waiters, cashiers, hosts, and inventory staff each see only what
                they need.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Dark mode</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Warm orange and beige theme with a full dark mode. Easy on the
                eyes during long shifts, day or night.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Blazing fast</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Built on Next.js 16 with Turbopack. Server components, optimized
                queries, and instant navigation for a snappy experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Ready to get started?
        </h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">
          Create your free account in seconds and start managing your restaurant
          today.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            href="/sign-up"
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            Create account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
          {["No credit card required", "Free for small teams", "Setup in 2 minutes"].map(
            (item) => (
              <div key={item} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" />
                {item}
              </div>
            )
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coffee className="w-4 h-4 text-primary" />
            RestoOS
          </div>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, TypeScript, Drizzle ORM, and Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}
