"use client";

import Link from "next/link";
import { Coffee } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg"><Coffee className="w-5 h-5" /></div>
            <span className="text-lg font-bold tracking-tight">RestoOS</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Back to home</Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>When you use RestoOS, we collect information you provide directly, including your name, email address, restaurant details, and payment information. We also collect usage data such as pages visited, features used, and interactions with the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve the RestoOS platform, process transactions, send notifications related to your restaurant operations, communicate with you about your account, and ensure the security of our services.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Storage and Security</h2>
            <p>Your data is stored securely using industry-standard encryption and infrastructure provided by Supabase and Vercel. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal information to third parties. We may share your information with trusted service providers who assist us in operating our platform, subject to confidentiality agreements. We may also disclose information when required by law or to protect our rights.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Tenant Data Isolation</h2>
            <p>RestoOS is a multi-tenant platform. Your restaurant data is isolated from other restaurants and is only accessible to users you authorize through your account and role assignments.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Cookies</h2>
            <p>We use cookies and similar technologies to maintain your session and improve your experience. You can control cookie settings through your browser preferences.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information. You can manage most of your data directly through the RestoOS settings. For additional requests, contact us at support@restoos.com.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact Us</h2>
            <p>If you have any questions about this privacy policy, please contact us at support@restoos.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
