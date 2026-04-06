"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-foreground rounded-xl flex items-center justify-center group-hover:scale-105 transition">
            <Layers className="w-4 h-4 text-background" />
          </div>
          <span
            className="font-semibold text-foreground tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Vault
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition">Home</Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">Dashboard</Link>
        </nav>

        {/* Auth Buttons */}
        {!user && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        )}

      </div>
    </header>
  );
}