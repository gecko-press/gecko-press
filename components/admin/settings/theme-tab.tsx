"use client";

import { Check, Palette, Type, Layout, Square, Settings2, Image, Hash, Mail } from "lucide-react";
import { colorPalettes, radiusScales, type RadiusScale } from "@/lib/theme/tokens";
import { fontSets } from "@/lib/theme/fonts";
import { heroVariants, cardVariants } from "@/lib/theme/registry";
import { availableIcons, getIcon } from "@/lib/theme/icons";
import type { HeroSettings, HeroCenteredSettings, HeroSplitSettings, HeroMinimalSettings } from "@/lib/supabase/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const defaultHeroSettings: HeroSettings = {
  centered: {
    badge: "Modern Blog Platform",
    title: "Modern Blog",
    subtitle: "Ultra Fast & SEO Focused",
    description: "Showcase your content with a modern, customizable blog platform.",
    searchPlaceholder: "Search articles...",
    features: [
      { icon: "Zap", title: "Lightning Fast", description: "Maximum performance" },
      { icon: "Globe", title: "SEO Optimized", description: "Rank higher" },
      { icon: "Shield", title: "Open Source", description: "Free under MIT" },
    ],
  },
  split: {
    badge: "Top Technology Blog",
    title: "Discover the",
    subtitle: "Future of Tech",
    description: "In-depth reviews and insights on the latest technology trends.",
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

type ThemeSettings = {
  hero_variant: string;
  card_variant: string;
  font_set: string;
  color_palette: string;
  radius: string;
  hero_settings: HeroSettings;
  newsletter_title: string;
  newsletter_description: string;
};

type ThemeTabProps = {
  settings: ThemeSettings;
  onChange: (settings: ThemeSettings) => void;
};

export function ThemeTab({ settings, onChange }: ThemeTabProps) {
  const centeredSettings = settings.hero_settings?.centered || {};
  const splitSettings = settings.hero_settings?.split || {};
  const minimalSettings = settings.hero_settings?.minimal || {};

  const heroSettings: HeroSettings = {
    centered: {
      ...defaultHeroSettings.centered,
      ...centeredSettings,
      features: centeredSettings.features?.length ? centeredSettings.features : defaultHeroSettings.centered.features,
    },
    split: {
      ...defaultHeroSettings.split,
      ...splitSettings,
      metrics: splitSettings.metrics?.length ? splitSettings.metrics : defaultHeroSettings.split.metrics,
    },
    minimal: { ...defaultHeroSettings.minimal, ...minimalSettings },
  };

  const updateHeroSettings = (variant: keyof HeroSettings, updates: Partial<HeroCenteredSettings | HeroSplitSettings | HeroMinimalSettings>) => {
    onChange({
      ...settings,
      hero_settings: {
        ...heroSettings,
        [variant]: {
          ...heroSettings[variant],
          ...updates,
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      <Section icon={<Layout className="w-4 h-4" />} title="Hero Layout" description="Choose how your homepage hero section appears">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.values(heroVariants).map((variant) => (
            <SelectableCard
              key={variant.id}
              selected={settings.hero_variant === variant.id}
              onClick={() => onChange({ ...settings, hero_variant: variant.id })}
              title={variant.name}
              description={variant.description}
            />
          ))}
        </div>
      </Section>

      <Section icon={<Settings2 className="w-4 h-4" />} title="Hero Content" description="Customize the content displayed in your hero section">
        {settings.hero_variant === "centered" && (
          <CenteredHeroFields
            settings={heroSettings.centered}
            onChange={(updates) => updateHeroSettings("centered", updates)}
          />
        )}
        {settings.hero_variant === "split" && (
          <SplitHeroFields
            settings={heroSettings.split}
            onChange={(updates) => updateHeroSettings("split", updates)}
          />
        )}
        {settings.hero_variant === "minimal" && (
          <MinimalHeroFields
            settings={heroSettings.minimal}
            onChange={(updates) => updateHeroSettings("minimal", updates)}
          />
        )}
      </Section>

      <Section icon={<Square className="w-4 h-4" />} title="Card Style" description="Choose how blog post cards look">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(cardVariants).map((variant) => (
            <SelectableCard
              key={variant.id}
              selected={settings.card_variant === variant.id}
              onClick={() => onChange({ ...settings, card_variant: variant.id })}
              title={variant.name}
              description={variant.description}
            />
          ))}
        </div>
      </Section>

      <Section icon={<Palette className="w-4 h-4" />} title="Color Palette" description="Set your brand colors">
        <div className="flex flex-wrap gap-2">
          {colorPalettes.map((palette) => (
            <button
              key={palette.id}
              onClick={() => onChange({ ...settings, color_palette: palette.id })}
              className={`relative w-10 h-10 rounded-md transition-all hover:scale-105 ${settings.color_palette === palette.id ? "ring-2 ring-offset-2 ring-primary" : ""
                }`}
              style={{ backgroundColor: `hsl(${palette.primary})` }}
              title={palette.name}
            >
              {settings.color_palette === palette.id && (
                <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          Selected: {colorPalettes.find((p) => p.id === settings.color_palette)?.name}
        </p>
      </Section>

      <Section icon={<Type className="w-4 h-4" />} title="Typography" description="Choose your font style">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {fontSets.map((font) => (
            <SelectableCard
              key={font.id}
              selected={settings.font_set === font.id}
              onClick={() => onChange({ ...settings, font_set: font.id })}
              title={font.name}
              description={font.description}
            />
          ))}
        </div>
      </Section>

      <Section icon={<Square className="w-4 h-4" />} title="Border Radius" description="Set the roundness of elements">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(radiusScales) as RadiusScale[]).map((key) => (
            <button
              key={key}
              onClick={() => onChange({ ...settings, radius: key })}
              className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-all ${settings.radius === key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
            >
              {radiusScales[key].label}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={<Mail className="w-4 h-4" />} title="Newsletter Section" description="Customize the newsletter subscription area">
        <div className="space-y-4">
          <FieldGroup label="Title">
            <Input
              value={settings.newsletter_title ?? ""}
              onChange={(e) => onChange({ ...settings, newsletter_title: e.target.value })}
              placeholder="Stay Updated"
            />
          </FieldGroup>
          <FieldGroup label="Description">
            <Textarea
              value={settings.newsletter_description ?? ""}
              onChange={(e) => onChange({ ...settings, newsletter_description: e.target.value })}
              placeholder="Join our newsletter for the latest updates..."
              rows={2}
            />
          </FieldGroup>
        </div>
      </Section>
    </div>
  );
}

function CenteredHeroFields({
  settings,
  onChange,
}: {
  settings: HeroCenteredSettings;
  onChange: (updates: Partial<HeroCenteredSettings>) => void;
}) {
  const updateFeature = (index: number, updates: Partial<{ icon: string; title: string; description: string }>) => {
    const newFeatures = [...settings.features];
    newFeatures[index] = { ...newFeatures[index], ...updates };
    onChange({ features: newFeatures });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Badge Text">
          <Input
            value={settings.badge}
            onChange={(e) => onChange({ badge: e.target.value })}
            placeholder="Powered by GeckoAuthority"
          />
        </FieldGroup>
        <FieldGroup label="Search Placeholder">
          <Input
            value={settings.searchPlaceholder}
            onChange={(e) => onChange({ searchPlaceholder: e.target.value })}
            placeholder="Search articles..."
          />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Main Title">
          <Input
            value={settings.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Modern Blog"
          />
        </FieldGroup>
        <FieldGroup label="Colored Subtitle">
          <Input
            value={settings.subtitle}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="Ultra Fast & SEO Focused"
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Description">
        <Textarea
          value={settings.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Showcase your content..."
          rows={2}
        />
      </FieldGroup>

      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-4">
        <Label className="text-sm font-medium mb-3 block">Feature Cards</Label>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {settings.features.map((feature, index) => (
            <div key={index} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Feature {index + 1}</span>
              </div>
              <IconSelect
                value={feature.icon}
                onChange={(icon) => updateFeature(index, { icon })}
              />
              <Input
                value={feature.title}
                onChange={(e) => updateFeature(index, { title: e.target.value })}
                placeholder="Title"
                className="text-sm"
              />
              <Input
                value={feature.description}
                onChange={(e) => updateFeature(index, { description: e.target.value })}
                placeholder="Description"
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SplitHeroFields({
  settings,
  onChange,
}: {
  settings: HeroSplitSettings;
  onChange: (updates: Partial<HeroSplitSettings>) => void;
}) {
  const updateMetric = (index: number, updates: Partial<{ icon: string; value: string; label: string }>) => {
    const newMetrics = [...settings.metrics];
    newMetrics[index] = { ...newMetrics[index], ...updates };
    onChange({ metrics: newMetrics });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Badge Text">
          <Input
            value={settings.badge}
            onChange={(e) => onChange({ badge: e.target.value })}
            placeholder="Top Technology Blog"
          />
        </FieldGroup>
        <FieldGroup label="Search Placeholder">
          <Input
            value={settings.searchPlaceholder}
            onChange={(e) => onChange({ searchPlaceholder: e.target.value })}
            placeholder="What are you looking for?"
          />
        </FieldGroup>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Main Title">
          <Input
            value={settings.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Discover the"
          />
        </FieldGroup>
        <FieldGroup label="Colored Subtitle">
          <Input
            value={settings.subtitle}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="Future of Tech"
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Description">
        <Textarea
          value={settings.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="In-depth reviews..."
          rows={2}
        />
      </FieldGroup>

      <FieldGroup label="Background Image URL">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-zinc-400" />
          <Input
            value={settings.imageUrl}
            onChange={(e) => onChange({ imageUrl: e.target.value })}
            placeholder="https://images.pexels.com/..."
            className="flex-1"
          />
        </div>
      </FieldGroup>

      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-4">
        <Label className="text-sm font-medium mb-3 block">Metrics</Label>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {settings.metrics.map((metric, index) => (
            <div key={index} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="w-3 h-3 text-zinc-400" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Metric {index + 1}</span>
              </div>
              <IconSelect
                value={metric.icon}
                onChange={(icon) => updateMetric(index, { icon })}
              />
              <Input
                value={metric.value}
                onChange={(e) => updateMetric(index, { value: e.target.value })}
                placeholder="500+"
                className="text-sm"
              />
              <Input
                value={metric.label}
                onChange={(e) => updateMetric(index, { label: e.target.value })}
                placeholder="Articles"
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MinimalHeroFields({
  settings,
  onChange,
}: {
  settings: HeroMinimalSettings;
  onChange: (updates: Partial<HeroMinimalSettings>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldGroup label="Main Title">
          <Input
            value={settings.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Tech insights,"
          />
        </FieldGroup>
        <FieldGroup label="Colored Subtitle">
          <Input
            value={settings.subtitle}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="simplified."
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Description">
        <Textarea
          value={settings.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Expert reviews and buying guides..."
          rows={2}
        />
      </FieldGroup>

      <FieldGroup label="Search Placeholder">
        <Input
          value={settings.searchPlaceholder}
          onChange={(e) => onChange({ searchPlaceholder: e.target.value })}
          placeholder="Search articles..."
        />
      </FieldGroup>
    </div>
  );
}

function IconSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const Icon = getIcon(value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9">
        <SelectValue>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <span className="text-sm">{value}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableIcons.map((iconName) => {
          const IconItem = getIcon(iconName);
          return (
            <SelectItem key={iconName} value={iconName}>
              <div className="flex items-center gap-2">
                <IconItem className="w-4 h-4" />
                <span>{iconName}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-zinc-500 dark:text-zinc-400">{label}</Label>
      {children}
    </div>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{icon}</div>
        <div>
          <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{title}</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SelectableCard({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-6 rounded-md border border-2 text-left transition-all ${selected
        ? "border-primary bg-primary/5 dark:bg-primary/10"
        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{title}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>
    </button>
  );
}
