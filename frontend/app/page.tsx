"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const features = [
  { icon: Shield, title: "Bank-grade Security", desc: "Your funds are protected with enterprise-level encryption and multi-layer authentication." },
  { icon: Zap, title: "Instant Transfers", desc: "Send money to any account in seconds. No delays, no hidden fees." },
  { icon: Globe, title: "Always Available", desc: "Access your account anytime, anywhere. 99.9% uptime guaranteed." },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-xs font-medium mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Trusted by thousands of users
          </div>

          <h1
            className="text-5xl md:text-7xl font-light text-foreground mb-6 animate-fade-in leading-[1.1] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Banking that
            <br />
            <em className="not-italic text-muted-foreground">actually works.</em>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-in">
            Simple, secure, and instant money transfers. Open an account in minutes and start sending money today.
          </p>

          <div className="flex items-center justify-center gap-3 animate-fade-in">
            {!user && (
              <Button size="lg" asChild>
                <Link href="/register">
                  Open Account <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            )}

            {!user && (
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-border bg-secondary/30">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: "₹10Cr+", label: "Transferred" },
            { value: "10K+", label: "Active Users" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat) => (
            <div key={stat.label}>
              <p
                className="text-3xl font-semibold text-foreground mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl font-light text-center mb-12 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything you need
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-background" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center bg-foreground rounded-3xl p-12">
            <h2
              className="text-3xl font-light text-background mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to get started?
            </h2>
            <p className="text-background/60 mb-8 text-sm">Create your account in under 2 minutes.</p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Create Free Account <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-sm text-muted-foreground">© 2026 Vault. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Simple. Secure. Banking.</p>
        </div>
      </footer>
    </div>
  );
}
