import Link from "next/link";
import { Coffee, Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: 49,
    desc: "For single-location restaurants",
    features: ["1 branch", "10 employees", "Point of Sale", "Order management", "Menu management", "Basic reports", "Customer profiles", "Email support"],
    popular: false,
  },
  {
    name: "Professional",
    price: 99,
    desc: "For growing restaurants",
    features: ["Up to 5 branches", "50 employees", "Everything in Starter", "Inventory management", "Reservations", "Employee management", "Advanced reports", "Multi-branch analytics", "Priority support"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: 199,
    desc: "For restaurant groups",
    features: ["Unlimited branches", "Unlimited employees", "Everything in Professional", "Custom roles & permissions", "API access", "Custom integrations", "Dedicated account manager", "Phone & chat support", "Custom onboarding"],
    popular: false,
  },
];

const comparison = [
  { feature: "Branches", starter: "1", professional: "Up to 5", enterprise: "Unlimited" },
  { feature: "Employees", starter: "10", professional: "50", enterprise: "Unlimited" },
  { feature: "Point of Sale", starter: true, professional: true, enterprise: true },
  { feature: "Order Management", starter: true, professional: true, enterprise: true },
  { feature: "Menu Management", starter: true, professional: true, enterprise: true },
  { feature: "Inventory Management", starter: false, professional: true, enterprise: true },
  { feature: "Reservations", starter: false, professional: true, enterprise: true },
  { feature: "Employee Management", starter: false, professional: true, enterprise: true },
  { feature: "Customer Profiles", starter: true, professional: true, enterprise: true },
  { feature: "Basic Reports", starter: true, professional: true, enterprise: true },
  { feature: "Advanced Reports", starter: false, professional: true, enterprise: true },
  { feature: "Multi-branch Analytics", starter: false, professional: true, enterprise: true },
  { feature: "Custom Roles", starter: false, professional: false, enterprise: true },
  { feature: "API Access", starter: false, professional: false, enterprise: true },
  { feature: "Priority Support", starter: false, professional: true, enterprise: true },
  { feature: "Dedicated Account Manager", starter: false, professional: false, enterprise: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg"><Coffee className="w-5 h-5" /></div>
            <span className="text-lg font-bold tracking-tight">RestoOS</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/sign-up" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Get started</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Simple, transparent pricing</h1>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-lg">Start free for 14 days. No credit card required. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {plans.map((p) => (
            <div key={p.name} className={`relative border rounded-2xl p-8 ${p.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border/60"}`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">Most Popular</div>}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              <div className="mt-4 mb-6"><span className="text-4xl font-bold">${p.price}</span><span className="text-muted-foreground">/mo</span></div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-primary shrink-0" /> {f}</li>
                ))}
              </ul>
              <Link href="/sign-up" className={`block text-center py-3 rounded-xl font-medium text-sm transition-opacity ${p.popular ? "bg-primary text-primary-foreground hover:opacity-90" : "border border-border hover:bg-muted"}`}>
                {p.name === "Enterprise" ? "Contact sales" : "Start free trial"}
              </Link>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">Feature comparison</h2>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Feature</th>
                  <th className="text-center p-4 font-medium">Starter</th>
                  <th className="text-center p-4 font-medium">Professional</th>
                  <th className="text-center p-4 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={i < comparison.length - 1 ? "border-b" : ""}>
                    <td className="p-4 text-muted-foreground">{row.feature}</td>
                    {(["starter", "professional", "enterprise"] as const).map((plan) => (
                      <td key={plan} className="p-4 text-center">
                        {typeof row[plan] === "boolean" ? (
                          row[plan] ? <Check className="w-4 h-4 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>
                        ) : (
                          <span>{String(row[plan])}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Coffee className="w-4 h-4 text-primary" /> RestoOS</div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
