import Link from "next/link";
import { Coffee, ShoppingCart, ClipboardList, Package, UtensilsCrossed, Users, UserCheck, CalendarDays, BarChart3, ArrowRight, Check, Zap, Shield, DollarSign, Building2 } from "lucide-react";

const featureIcons = {
  pos: <ShoppingCart className="w-6 h-6" />,
  orders: <ClipboardList className="w-6 h-6" />,
  inventory: <Package className="w-6 h-6" />,
  menu: <UtensilsCrossed className="w-6 h-6" />,
  employees: <Users className="w-6 h-6" />,
  customers: <UserCheck className="w-6 h-6" />,
  reservations: <CalendarDays className="w-6 h-6" />,
  reports: <BarChart3 className="w-6 h-6" />,
};

const features = [
  { key: "pos", title: "Point of Sale", desc: "Fast, intuitive POS with table assignment, modifiers, split bills, and real-time order tracking." },
  { key: "orders", title: "Orders", desc: "Full order lifecycle from draft to completion. Filter by status, search by number, and manage every detail." },
  { key: "inventory", title: "Inventory", desc: "Track ingredients, stock levels, expiration dates, and automatic deductions when orders are placed." },
  { key: "menu", title: "Menu", desc: "Organize menu items by categories, set pricing, recipes with ingredient mapping, and modifiers." },
  { key: "employees", title: "Employees", desc: "Manage staff roles, positions, schedules, salaries, and performance across all your branches." },
  { key: "customers", title: "Customers", desc: "Build customer profiles, track order history, contact info, and notes for personalized service." },
  { key: "reservations", title: "Reservations", desc: "Accept and manage reservations, assign tables, track party sizes, and handle special requests." },
  { key: "reports", title: "Reports", desc: "Revenue, orders, menu performance, expenses, employee hours, and customer analytics in one place." },
];

const plans = [
  { name: "Starter", price: 49, desc: "For single-location restaurants", features: ["1 branch", "10 employees", "Point of Sale", "Order management", "Menu management", "Basic reports", "Customer profiles", "Email support"], popular: false },
  { name: "Professional", price: 99, desc: "For growing restaurants", features: ["Up to 5 branches", "50 employees", "Everything in Starter", "Inventory management", "Reservations", "Employee management", "Advanced reports", "Multi-branch analytics", "Priority support"], popular: true },
  { name: "Enterprise", price: 199, desc: "For restaurant groups", features: ["Unlimited branches", "Unlimited employees", "Everything in Professional", "Custom roles & permissions", "API access", "Custom integrations", "Dedicated account manager", "Phone & chat support", "Custom onboarding"], popular: false },
];

const faqs = [
  { q: "What is RestoOS?", a: "RestoOS is a complete restaurant management platform that combines point of sale, orders, inventory, menu management, reservations, employees, and reporting into a single, easy-to-use application." },
  { q: "Does it support multiple branches?", a: "Yes. Our Professional and Enterprise plans support multiple branches with centralized reporting and management." },
  { q: "Can different employees have different permissions?", a: "Absolutely. RestoOS comes with 7 built-in roles — owner, manager, chef, waiter, cashier, host, and inventory manager — each with specific permissions." },
  { q: "Can I manage inventory?", a: "Yes. Track ingredients, suppliers, purchase orders, and stock levels. Inventory automatically deducts when orders are completed based on recipes." },
  { q: "Can I manage reservations?", a: "Yes. Create and manage reservations with table assignments, party sizes, special requests, and real-time availability checking." },
  { q: "Can I try it before subscribing?", a: "Yes! Every plan comes with a 14-day free trial. No credit card required. You can also try our demo to see RestoOS in action." },
  { q: "How does onboarding work?", a: "After signing up, a guided setup wizard walks you through creating your restaurant, adding branches, setting up your menu, and configuring your team." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg"><Coffee className="w-5 h-5" /></div>
            <span className="text-lg font-bold tracking-tight">RestoOS</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/sign-up" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Get started</Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" /> Built for modern restaurants
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto">
            Run your restaurant<br /><span className="text-primary">from one place</span>
          </h1>
          <p className="text-muted-foreground text-lg mt-6 max-w-xl mx-auto leading-relaxed">
            Point of sale, orders, inventory, menu management, reservations, employees, and analytics — all in a single, beautiful platform.
          </p>
          <div className="flex items-center justify-center gap-3 mt-10">
            <Link href="/demo" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
              Try Live Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/sign-up" className="border border-border px-6 py-3 rounded-xl font-medium text-sm hover:bg-muted transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">From taking orders to tracking inventory, RestoOS handles it all so you can focus on what matters.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.key} className="group border border-border/60 rounded-2xl p-6 hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300">
              <div className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {featureIcons[f.key as keyof typeof featureIcons]}
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Why restaurants choose RestoOS</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Real business outcomes, not just features.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="w-5 h-5" />, title: "Reduce order errors", desc: "Clear order routing eliminates miscommunication between front and back of house." },
              { icon: <Package className="w-5 h-5" />, title: "Control inventory costs", desc: "Real-time stock tracking with automatic deductions. Never run out of key ingredients." },
              { icon: <DollarSign className="w-5 h-5" />, title: "Understand your revenue", desc: "Detailed analytics on revenue, expenses, margins, and top-selling items." },
              { icon: <Users className="w-5 h-5" />, title: "Manage staff permissions", desc: "7 built-in roles with granular permissions for every team member." },
              { icon: <Building2 className="w-5 h-5" />, title: "Monitor all branches", desc: "Multi-branch support with centralized reporting from one dashboard." },
              { icon: <BarChart3 className="w-5 h-5" />, title: "Centralize operations", desc: "POS, orders, reservations, inventory, and staff in a single platform." },
            ].map((b) => (
              <div key={b.title} className="flex gap-4">
                <div className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center shrink-0">{b.icon}</div>
                <div>
                  <h3 className="font-semibold mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Start free for 14 days. No credit card required.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className={`relative border rounded-2xl p-8 ${p.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border/60"}`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">Most Popular</div>}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">${p.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href={p.popular ? "/sign-up" : "/sign-up"} className={`block text-center py-3 rounded-xl font-medium text-sm transition-opacity ${p.popular ? "bg-primary text-primary-foreground hover:opacity-90" : "border border-border hover:bg-muted"}`}>
                {p.popular ? "Start free trial" : p.name === "Enterprise" ? "Contact sales" : "Start free trial"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="border-y border-border/50 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="border border-border/60 rounded-xl p-6 bg-card">
                <h3 className="font-semibold mb-2">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Ready to get started?</h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">Create your free account in seconds and start managing your restaurant today.</p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link href="/demo" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
            Try Live Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/sign-up" className="border border-border px-8 py-3 rounded-xl font-medium text-sm hover:bg-muted transition-colors">
            Create Account
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
          {["No credit card required", "Free for small teams", "Setup in 2 minutes"].map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" /> {item}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg"><Coffee className="w-4 h-4" /></div>
                <span className="font-bold">RestoOS</span>
              </div>
              <p className="text-sm text-muted-foreground">Run your restaurant from one place.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link href="/demo" className="hover:text-foreground transition-colors">Demo</Link></li>
                <li><Link href="/sign-in" className="hover:text-foreground transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} RestoOS. All rights reserved. Built with Next.js, TypeScript, Drizzle ORM, and Supabase.
          </div>
        </div>
      </footer>
    </div>
  );
}
