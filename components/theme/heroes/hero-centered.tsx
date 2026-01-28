"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { getIcon } from "@/lib/theme/icons";
import type { HeroCenteredSettings } from "@/lib/supabase/types";

type Props = {
  settings?: HeroCenteredSettings;
};

const defaultSettings: HeroCenteredSettings = {
  badge: "Powered by GeckoAuthority",
  title: "Modern Blog",
  subtitle: "Ultra Fast & SEO Focused",
  description: "Showcase your content created with GeckoAuthority. Meet the world's fastest autonomous blog platform.",
  searchPlaceholder: "Search articles...",
  features: [
    { icon: "Zap", title: "Lightning Fast", description: "Maximum performance with Next.js 13" },
    { icon: "Globe", title: "SEO Optimized", description: "Rank higher in search engines" },
    { icon: "Shield", title: "Open Source", description: "Completely free under MIT license" },
  ],
};

export function HeroCentered({ settings = defaultSettings }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const config = { ...defaultSettings, ...settings };
  const BadgeIcon = getIcon("Zap");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 sm:pt-20 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in border border-primary/20">
          <BadgeIcon className="w-4 h-4" />
          <span>{config.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 animate-slide-up">
          <span className="text-foreground">{config.title}</span>
          <br />
          <span className="text-primary">{config.subtitle}</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {config.description}
        </p>

        <form
          onSubmit={handleSearch}
          className="relative max-w-xl mx-auto mb-8 animate-slide-up"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-accent/50 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={config.searchPlaceholder}
                className="w-full pl-12 pr-32 py-4 bg-card border border-border rounded-3xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-3xl hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto animate-slide-up mt-20" style={{ animationDelay: "0.3s" }}>
          {config.features.map((feature, index) => {
            const FeatureIcon = getIcon(feature.icon);
            return (
              <div key={index} className="flex flex-col items-center gap-2 p-5 rounded-xl bg-card border transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FeatureIcon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground text-center">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
