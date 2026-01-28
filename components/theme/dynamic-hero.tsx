"use client";

import { useThemeConfig } from "@/lib/theme/context";
import { HeroCentered, HeroSplit, HeroMinimal } from "./heroes";
import type { HeroVariantId } from "@/lib/theme/registry";
import { Loader2 } from "lucide-react";

function HeroLoading() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    </section>
  );
}

export function DynamicHero() {
  const { config, isReady } = useThemeConfig();

  if (!isReady) {
    return <HeroLoading />;
  }

  const heroSettings = config.heroSettings;

  switch (config.heroVariant) {
    case "centered":
      return <HeroCentered settings={heroSettings.centered} />;
    case "split":
      return <HeroSplit settings={heroSettings.split} />;
    case "minimal":
      return <HeroMinimal settings={heroSettings.minimal} />;
    default:
      return <HeroCentered settings={heroSettings.centered} />;
  }
}
