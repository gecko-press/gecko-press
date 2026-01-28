"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import type { HeroMinimalSettings } from "@/lib/supabase/types";

type Props = {
  settings?: HeroMinimalSettings;
};

const defaultSettings: HeroMinimalSettings = {
  title: "Tech insights,",
  subtitle: "simplified.",
  description: "Expert reviews and buying guides to help you make smarter tech decisions.",
  searchPlaceholder: "Search articles...",
};

export function HeroMinimal({ settings = defaultSettings }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const config = { ...defaultSettings, ...settings };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <section className="relative min-h-[70vh] flex items-center mt-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
          <span className="text-foreground">{config.title}</span>
          <br />
          <span className="text-primary">{config.subtitle}</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {config.description}
        </p>

        <form
          onSubmit={handleSearch}
          className="relative max-w-lg mx-auto mb-12 animate-slide-up"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={config.searchPlaceholder}
              className="w-full pl-14 pr-6 py-5 bg-muted/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-lg"
            />
          </div>
        </form>
      </div>
    </section>
  );
}
