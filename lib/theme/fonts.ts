export type FontSet = {
  id: string;
  name: string;
  description: string;
  heading: {
    family: string;
    weight: string;
    letterSpacing: string;
  };
  body: {
    family: string;
    weight: string;
    lineHeight: string;
  };
  mono: {
    family: string;
  };
  googleFonts?: string[];
};

export const fontSets: FontSet[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and contemporary look",
    heading: {
      family: "Inter, system-ui, sans-serif",
      weight: "700",
      letterSpacing: "-0.025em",
    },
    body: {
      family: "Inter, system-ui, sans-serif",
      weight: "400",
      lineHeight: "1.6",
    },
    mono: {
      family: "ui-monospace, SFMono-Regular, monospace",
    },
    googleFonts: ["Inter:wght@400;500;600;700"],
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Classic editorial style",
    heading: {
      family: "Playfair Display, Georgia, serif",
      weight: "700",
      letterSpacing: "-0.01em",
    },
    body: {
      family: "Source Sans 3, system-ui, sans-serif",
      weight: "400",
      lineHeight: "1.7",
    },
    mono: {
      family: "ui-monospace, SFMono-Regular, monospace",
    },
    googleFonts: ["Playfair+Display:wght@700", "Source+Sans+3:wght@400;600"],
  },
  {
    id: "tech",
    name: "Tech",
    description: "Developer-focused aesthetic",
    heading: {
      family: "JetBrains Mono, monospace",
      weight: "700",
      letterSpacing: "0",
    },
    body: {
      family: "system-ui, -apple-system, sans-serif",
      weight: "400",
      lineHeight: "1.6",
    },
    mono: {
      family: "JetBrains Mono, monospace",
    },
    googleFonts: ["JetBrains+Mono:wght@400;700"],
  },
];

export function getFontSet(id: string): FontSet {
  return fontSets.find((f) => f.id === id) || fontSets[0];
}

export function buildGoogleFontsUrl(fontSet: FontSet): string | null {
  if (!fontSet.googleFonts || fontSet.googleFonts.length === 0) return null;
  const families = fontSet.googleFonts.join("&family=");
  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
}
