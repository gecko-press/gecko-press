"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { HeroVariantId, CardVariantId } from "./registry";
import type { RadiusScale, SpacingScale } from "./tokens";
import { getColorPalette, radiusScales } from "./tokens";
import { getFontSet, buildGoogleFontsUrl } from "./fonts";
import { supabase } from "@/lib/supabase/client";
import type { HeroSettings } from "@/lib/supabase/types";

export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
};

const defaultSiteSettings: SiteSettings = {
  siteName: "GeckoPress",
  siteDescription: "Modern Blog Platform",
  logoUrl: "/geckopress-logo.svg",
};

const defaultHeroSettings: HeroSettings = {
  centered: {
    badge: "Modern Blog Platform",
    title: "Modern Blog",
    subtitle: "Ultra Fast & SEO Focused",
    description: "Showcase your content with a modern, customizable blog platform built with Next.js and Supabase.",
    searchPlaceholder: "Search articles...",
    features: [
      { icon: "Zap", title: "Lightning Fast", description: "Maximum performance with Next.js 13" },
      { icon: "Globe", title: "SEO Optimized", description: "Rank higher in search engines" },
      { icon: "Shield", title: "Open Source", description: "Completely free under MIT license" },
    ],
  },
  split: {
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
  },
  minimal: {
    title: "Tech insights,",
    subtitle: "simplified.",
    description: "Expert reviews and buying guides to help you make smarter tech decisions.",
    searchPlaceholder: "Search articles...",
  },
};

export type ThemeConfig = {
  heroVariant: HeroVariantId;
  cardVariant: CardVariantId;
  fontSet: string;
  colorPalette: string;
  radius: RadiusScale;
  spacing: SpacingScale;
  heroSettings: HeroSettings;
  siteSettings: SiteSettings;
};

const defaultConfig: ThemeConfig = {
  heroVariant: "centered",
  cardVariant: "classic",
  fontSet: "modern",
  colorPalette: "emerald",
  radius: "md",
  spacing: "comfortable",
  heroSettings: defaultHeroSettings,
  siteSettings: defaultSiteSettings,
};

const THEME_CACHE_KEY = "geckopress-theme-cache";

function getCachedTheme(): ThemeConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(THEME_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        ...defaultConfig,
        ...parsed,
        siteSettings: { ...defaultSiteSettings, ...parsed.siteSettings },
        heroSettings: { ...defaultHeroSettings, ...parsed.heroSettings },
      };
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function setCachedTheme(config: ThemeConfig) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage errors
  }
}

type ThemeContextType = {
  config: ThemeConfig;
  isReady: boolean;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const cached = getCachedTheme();
    if (cached) {
      setConfig(cached);
      updateCurrentConfig(cached);
      applyThemeStyles(cached);
      setIsReady(true);
    }

    const themeObserver = setupThemeObserver();

    async function fetchAllSettings() {
      try {
        const [themeResult, siteResult] = await Promise.all([
          supabase
            .from("theme_settings")
            .select("*")
            .eq("key", "global")
            .maybeSingle(),
          supabase
            .from("site_settings")
            .select("logo_url")
            .maybeSingle(),
        ]);

        setConfig((prev) => {
          const newConfig: ThemeConfig = { ...prev };

          if (themeResult.data && !themeResult.error) {
            newConfig.heroVariant = themeResult.data.hero_variant as HeroVariantId;
            newConfig.cardVariant = themeResult.data.card_variant as CardVariantId;
            newConfig.fontSet = themeResult.data.font_set;
            newConfig.colorPalette = themeResult.data.color_palette;
            newConfig.radius = themeResult.data.radius as RadiusScale;
            newConfig.heroSettings = themeResult.data.hero_settings || defaultHeroSettings;
          }

          if (siteResult.data && !siteResult.error) {
            newConfig.siteSettings = {
              ...defaultSiteSettings,
              logoUrl: siteResult.data.logo_url || defaultSiteSettings.logoUrl,
            };
          }

          setCachedTheme(newConfig);
          updateCurrentConfig(newConfig);
          applyThemeStyles(newConfig);
          return newConfig;
        });
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsReady(true);
      }
    }

    fetchAllSettings();

    const themeChannel = supabase
      .channel("theme_settings_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "theme_settings" },
        (payload) => {
          const data = payload.new;
          setConfig((prev) => {
            const newConfig: ThemeConfig = {
              ...prev,
              heroVariant: data.hero_variant as HeroVariantId,
              cardVariant: data.card_variant as CardVariantId,
              fontSet: data.font_set,
              colorPalette: data.color_palette,
              radius: data.radius as RadiusScale,
              heroSettings: data.hero_settings || defaultHeroSettings,
            };
            setCachedTheme(newConfig);
            updateCurrentConfig(newConfig);
            applyThemeStyles(newConfig);
            return newConfig;
          });
        }
      )
      .subscribe();

    const siteChannel = supabase
      .channel("site_settings_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_settings" },
        (payload) => {
          const data = payload.new as { logo_url?: string };
          setConfig((prev) => {
            const newConfig: ThemeConfig = {
              ...prev,
              siteSettings: {
                ...defaultSiteSettings,
                logoUrl: data.logo_url || defaultSiteSettings.logoUrl,
              },
            };
            setCachedTheme(newConfig);
            return newConfig;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(themeChannel);
      supabase.removeChannel(siteChannel);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ config, isReady }}>
      <FontLoader fontSetId={config.fontSet} />
      {!isReady && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}
      <div className={isReady ? "opacity-100" : "opacity-0"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useThemeConfig() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeConfig must be used within ThemeConfigProvider");
  }
  return context;
}

function FontLoader({ fontSetId }: { fontSetId: string }) {
  const fontSet = getFontSet(fontSetId);
  const url = buildGoogleFontsUrl(fontSet);

  useEffect(() => {
    if (!url) return;

    const existingLink = document.querySelector(`link[data-theme-fonts]`);
    if (existingLink) {
      existingLink.setAttribute("href", url);
    } else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.setAttribute("data-theme-fonts", "true");
      document.head.appendChild(link);
    }
  }, [url]);

  return null;
}

function applyThemeStyles(config: ThemeConfig) {
  const palette = getColorPalette(config.colorPalette);
  const fontSet = getFontSet(config.fontSet);
  const radius = radiusScales[config.radius];

  const root = document.documentElement;

  const hue = palette.primary.split(" ")[0];
  const isDark = root.classList.contains("dark");

  root.style.setProperty("--primary", palette.primary);
  root.style.setProperty("--primary-foreground", `${hue} 10% 98%`);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-foreground", `${hue} 50% 20%`);

  if (isDark) {
    root.style.setProperty("--border", `${hue} 15% 16%`);
    root.style.setProperty("--input", `${hue} 15% 16%`);
    root.style.setProperty("--ring", palette.primary);
    root.style.setProperty("--muted", `${hue} 15% 14%`);
    root.style.setProperty("--muted-foreground", `${hue} 10% 55%`);
    root.style.setProperty("--card", `${hue} 15% 8%`);
    root.style.setProperty("--card-foreground", `${hue} 10% 95%`);
    root.style.setProperty("--popover", `${hue} 15% 8%`);
    root.style.setProperty("--popover-foreground", `${hue} 10% 95%`);
    root.style.setProperty("--secondary", `${hue} 15% 14%`);
    root.style.setProperty("--secondary-foreground", `${hue} 10% 95%`);
  } else {
    root.style.setProperty("--border", `${hue} 10% 90%`);
    root.style.setProperty("--input", `${hue} 10% 90%`);
    root.style.setProperty("--ring", palette.primary);
    root.style.setProperty("--muted", `${hue} 10% 96%`);
    root.style.setProperty("--muted-foreground", `${hue} 10% 40%`);
    root.style.setProperty("--card", "0 0% 100%");
    root.style.setProperty("--card-foreground", `${hue} 10% 10%`);
    root.style.setProperty("--popover", "0 0% 100%");
    root.style.setProperty("--popover-foreground", `${hue} 10% 10%`);
    root.style.setProperty("--secondary", `${hue} 10% 96%`);
    root.style.setProperty("--secondary-foreground", `${hue} 10% 10%`);
  }

  root.style.setProperty("--font-heading", fontSet.heading.family);
  root.style.setProperty("--font-body", fontSet.body.family);
  root.style.setProperty("--font-mono", fontSet.mono.family);

  root.style.setProperty("--radius", radius.value);
}

let currentConfig: ThemeConfig = defaultConfig;

function setupThemeObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        applyThemeStyles(currentConfig);
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });
  return observer;
}

function updateCurrentConfig(config: ThemeConfig) {
  currentConfig = config;
}
