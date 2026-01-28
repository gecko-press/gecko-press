import { createClient } from "@supabase/supabase-js";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("*")
    .maybeSingle();

  const baseUrl = siteSettings?.site_url || process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const { data: posts } = await supabase
    .from("posts")
    .select("*, category:categories(name, slug)")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(50);

  const siteName = siteSettings?.author_name || "Blog";
  const siteDescription = "Latest articles and news";

  const rssItems = (posts || [])
    .map((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.published_at || post.created_at).toUTCString();
      const description = post.excerpt || stripHtml(post.content || "").substring(0, 300);

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      ${post.category ? `<category>${escapeXml(post.category.name)}</category>` : ""}
      ${post.author ? `<author>${escapeXml(post.author)}</author>` : ""}
      ${post.featured_image ? `<enclosure url="${escapeXml(post.featured_image)}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
