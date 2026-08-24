"use client";

import Link from "next/link";
import { Coffee } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using RestoOS, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>RestoOS is a restaurant management platform that provides point of sale, order management, inventory tracking, menu management, reservation management, employee management, and reporting tools. The service is provided &quot;as is&quot; and may be modified or updated at any time.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Account Registration</h2>
            <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Subscription and Payment</h2>
            <p>Paid plans are billed monthly in advance. You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. We do not provide partial refunds for unused portions of a billing period.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Ownership</h2>
            <p>You retain ownership of all data you enter into RestoOS. We will not use your restaurant data for any purpose other than providing the service to you. Upon account deletion, we will delete your data in accordance with our data retention policies.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Acceptable Use</h2>
            <p>You agree not to use RestoOS for any unlawful purpose, attempt to gain unauthorized access to any part of the platform, interfere with or disrupt the service, or exceed the usage limits of your subscription plan.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, RestoOS shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. We will notify you of significant changes by posting the updated terms on this page and, where appropriate, by email notification.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact</h2>
            <p>For questions about these terms, contact us at support@restoos.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
