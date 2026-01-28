import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: settings } = await supabase
    .from("site_settings")
    .select("site_url")
    .maybeSingle();

  const baseUrl = settings?.site_url || process.env.NEXT_PUBLIC_SITE_URL || "https://geckopress.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/login", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
