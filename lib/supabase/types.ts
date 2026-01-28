export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  show_on_homepage: boolean;
  created_at: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category_id: string | null;
  author_name: string;
  author_avatar: string | null;
  reading_time: number;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  meta_description?: string | null;
  content_images?: Array<{ url: string; altText: string }>;
  audio_url?: string | null;
  youtube_video_id?: string | null;
  json_ld_schemas?: unknown[];
  tags?: string[];
  source?: string;
};

export type HeroCenteredSettings = {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  searchPlaceholder: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
};

export type HeroSplitSettings = {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  searchPlaceholder: string;
  imageUrl: string;
  metrics: Array<{
    icon: string;
    value: string;
    label: string;
  }>;
};

export type HeroMinimalSettings = {
  title: string;
  subtitle: string;
  description: string;
  searchPlaceholder: string;
};

export type HeroSettings = {
  centered: HeroCenteredSettings;
  split: HeroSplitSettings;
  minimal: HeroMinimalSettings;
};

export type ThemeSettings = {
  id: string;
  key: string;
  hero_variant: string;
  card_variant: string;
  font_set: string;
  color_palette: string;
  radius: string;
  hero_settings: HeroSettings;
  newsletter_title: string;
  newsletter_description: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
  post?: Post;
};
