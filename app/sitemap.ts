import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("site_url")
    .maybeSingle();

  const baseUrl = siteSettings?.site_url || process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const { data: posts } = await supabase
    .from("posts")
    .select("slug, updated_at, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("slug")
    .order("name");

  const { data: pages } = await supabase
    .from("pages")
    .select("slug, updated_at")
    .eq("published", true);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const postUrls: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryUrls: MetadataRoute.Sitemap = (categories || []).map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const pageUrls: MetadataRoute.Sitemap = (pages || []).map((page) => ({
    url: `${baseUrl}/page/${page.slug}`,
    lastModified: new Date(page.updated_at),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...postUrls, ...categoryUrls, ...pageUrls];
}
