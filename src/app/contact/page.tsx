"use client";

import Link from "next/link";
import { Coffee, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

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
            <Link href="/sign-in" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">Sign in</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Get in touch</h1>
            <p className="text-muted-foreground text-lg mb-10">Have questions about RestoOS? We would love to hear from you. Send us a message and we will respond as soon as possible.</p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center shrink-0"><Mail className="w-5 h-5" /></div>
                <div><h3 className="font-semibold mb-1">Email</h3><p className="text-sm text-muted-foreground">support@restoos.com</p></div>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center shrink-0"><Phone className="w-5 h-5" /></div>
                <div><h3 className="font-semibold mb-1">Phone</h3><p className="text-sm text-muted-foreground">+1 (555) 000-0000</p></div>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center shrink-0"><MapPin className="w-5 h-5" /></div>
                <div><h3 className="font-semibold mb-1">Office</h3><p className="text-sm text-muted-foreground">San Francisco, CA</p></div>
              </div>
            </div>
          </div>

          <div className="border rounded-2xl p-8 bg-card">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4"><Send className="w-6 h-6" /></div>
                <h3 className="text-lg font-semibold mb-2">Message sent!</h3>
                <p className="text-sm text-muted-foreground">Thank you for contacting us. We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <input required className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <input required type="email" className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <input className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="How can we help?" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <textarea required rows={5} className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" placeholder="Tell us more..." />
                </div>
                <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  Send message <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
