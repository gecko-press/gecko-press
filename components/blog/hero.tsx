"use client";

import { ArrowRight, Zap, Shield, Globe, Search } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/blog?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center mt-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6 animate-fade-in">
          <Zap className="w-3.5 h-3.5" />
          <span>Powered by GeckoAuthority</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 animate-slide-up">
          <span className="text-foreground">Modern Blog</span>
          <br />
          <span className="text-primary">Ultra Fast & SEO Focused</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Showcase your content created with GeckoAuthority.
          Meet the world&apos;s fastest autonomous blog platform.
        </p>

        <form
          onSubmit={handleSearch}
          className="relative max-w-xl mx-auto mb-8 animate-slide-up"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-accent/50 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-32 py-4 bg-card border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto animate-slide-up mt-20" style={{ animationDelay: "0.3s" }}>
          <div className="flex flex-col items-center gap-2 p-5 rounded-xl bg-card border transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Lightning Fast</h3>
            <p className="text-xs text-muted-foreground text-center">
              Maximum performance with Next.js 13
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 p-5 rounded-xl bg-card border transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">SEO Optimized</h3>
            <p className="text-xs text-muted-foreground text-center">
              Rank higher in search engines
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 p-5 rounded-xl bg-card border transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Open Source</h3>
            <p className="text-xs text-muted-foreground text-center">
              Completely free under MIT license
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
