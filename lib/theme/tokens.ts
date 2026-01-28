export type ColorPalette = {
  id: string;
  name: string;
  primary: string;
  accent: string;
  background: {
    light: string;
    dark: string;
  };
};

export type SpacingScale = "compact" | "comfortable" | "spacious";
export type RadiusScale = "none" | "sm" | "md" | "lg" | "full";

export const colorPalettes: ColorPalette[] = [
  {
    id: "forest",
    name: "Forest",
    primary: "152 60% 36%",
    accent: "152 60% 94%",
    background: {
      light: "0 0% 100%",
      dark: "160 15% 6%",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    primary: "210 70% 45%",
    accent: "210 70% 94%",
    background: {
      light: "0 0% 100%",
      dark: "215 25% 8%",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    primary: "25 85% 55%",
    accent: "25 85% 94%",
    background: {
      light: "0 0% 100%",
      dark: "20 20% 8%",
    },
  },
  {
    id: "rose",
    name: "Rose",
    primary: "350 70% 50%",
    accent: "350 70% 94%",
    background: {
      light: "0 0% 100%",
      dark: "350 15% 8%",
    },
  },
  {
    id: "slate",
    name: "Slate",
    primary: "220 15% 40%",
    accent: "220 15% 94%",
    background: {
      light: "0 0% 100%",
      dark: "220 20% 8%",
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    primary: "160 84% 39%",
    accent: "160 84% 94%",
    background: {
      light: "0 0% 100%",
      dark: "165 20% 6%",
    },
  },
  {
    id: "amber",
    name: "Amber",
    primary: "45 93% 47%",
    accent: "45 93% 94%",
    background: {
      light: "0 0% 100%",
      dark: "40 20% 6%",
    },
  },
  {
    id: "coral",
    name: "Coral",
    primary: "16 85% 60%",
    accent: "16 85% 94%",
    background: {
      light: "0 0% 100%",
      dark: "15 20% 7%",
    },
  },
  {
    id: "teal",
    name: "Teal",
    primary: "175 70% 40%",
    accent: "175 70% 94%",
    background: {
      light: "0 0% 100%",
      dark: "175 20% 6%",
    },
  },
  {
    id: "crimson",
    name: "Crimson",
    primary: "0 72% 51%",
    accent: "0 72% 94%",
    background: {
      light: "0 0% 100%",
      dark: "0 20% 7%",
    },
  },
  {
    id: "sky",
    name: "Sky",
    primary: "199 89% 48%",
    accent: "199 89% 94%",
    background: {
      light: "0 0% 100%",
      dark: "200 25% 7%",
    },
  },
  {
    id: "lime",
    name: "Lime",
    primary: "84 78% 42%",
    accent: "84 78% 94%",
    background: {
      light: "0 0% 100%",
      dark: "85 20% 6%",
    },
  },
  {
    id: "gold",
    name: "Gold",
    primary: "43 74% 49%",
    accent: "43 74% 94%",
    background: {
      light: "0 0% 100%",
      dark: "40 20% 6%",
    },
  },
  {
    id: "navy",
    name: "Navy",
    primary: "224 64% 33%",
    accent: "224 64% 94%",
    background: {
      light: "0 0% 100%",
      dark: "225 30% 6%",
    },
  },
  {
    id: "charcoal",
    name: "Charcoal",
    primary: "0 0% 25%",
    accent: "0 0% 94%",
    background: {
      light: "0 0% 100%",
      dark: "0 0% 6%",
    },
  },
];

export const spacingScales: Record<SpacingScale, { label: string; multiplier: number }> = {
  compact: { label: "Compact", multiplier: 0.85 },
  comfortable: { label: "Comfortable", multiplier: 1 },
  spacious: { label: "Spacious", multiplier: 1.2 },
};

export const radiusScales: Record<RadiusScale, { label: string; value: string }> = {
  none: { label: "Sharp", value: "0" },
  sm: { label: "Subtle", value: "0.25rem" },
  md: { label: "Medium", value: "0.5rem" },
  lg: { label: "Rounded", value: "0.75rem" },
  full: { label: "Pill", value: "9999px" },
};

export function getColorPalette(id: string): ColorPalette {
  return colorPalettes.find((p) => p.id === id) || colorPalettes.find((p) => p.id === "emerald")!;
}
