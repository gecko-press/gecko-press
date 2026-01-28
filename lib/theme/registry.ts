export type HeroVariantId = "centered" | "split" | "minimal";
export type CardVariantId = "classic" | "modern";

export type VariantMeta = {
  id: string;
  name: string;
  description: string;
  preview?: string;
};

export const heroVariants: Record<HeroVariantId, VariantMeta> = {
  centered: {
    id: "centered",
    name: "Centered",
    description: "Classic centered layout with search bar",
  },
  split: {
    id: "split",
    name: "Split",
    description: "Two-column layout with featured image",
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Clean, text-focused design",
  },
};

export const cardVariants: Record<CardVariantId, VariantMeta> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Traditional blog card with image on top",
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Contemporary card with hover effects",
  },
};

export function getHeroVariants(): VariantMeta[] {
  return Object.values(heroVariants);
}

export function getCardVariants(): VariantMeta[] {
  return Object.values(cardVariants);
}
