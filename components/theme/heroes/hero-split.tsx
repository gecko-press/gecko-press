"use client";

import { Search, ArrowRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { getIcon } from "@/lib/theme/icons";
import type { HeroSplitSettings } from "@/lib/supabase/types";

type Props = {
  settings?: HeroSplitSettings;
};

const defaultSettings: HeroSplitSettings = {
  badge: "Top Technology Blog",
  title: "Discover the",
  subtitle: "Future of Tech",
  description: "In-depth reviews, guides, and insights on the latest technology trends. Stay ahead with expert analysis and recommendations.",
  searchPlaceholder: "What are you looking for?",
  imageUrl: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200",
  metrics: [
    { icon: "BookOpen", value: "500+", label: "Articles" },
    { icon: "Users", value: "50K+", label: "Readers" },
    { icon: "TrendingUp", value: "10+", label: "Categories" },
  ],
};

export function HeroSplit({ settings = defaultSettings }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const config = { ...defaultSettings, ...settings };
  const BadgeIcon = getIcon("TrendingUp");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background to-transparent z-10" />

      <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
        <Image
          src={config.imageUrl}
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <BadgeIcon className="w-4 h-4" />
            <span>{config.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
            {config.title}
            <span className="block text-primary mt-2">{config.subtitle}</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {config.description}
          </p>

          <form
            onSubmit={handleSearch}
            className="relative max-w-md mb-10 animate-slide-up"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={config.searchPlaceholder}
                  className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <span className="hidden sm:inline">Search</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-6 animate-slide-up" style={{ animationDelay: "0.25s" }}>
            {config.metrics.map((metric, index) => {
              const MetricIcon = getIcon(metric.icon);
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-3xl bg-primary/10 flex items-center justify-center">
                    <MetricIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{metric.value}</p>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
