import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Calendar, Clock, User, Eye } from "lucide-react";
import { ShareButtons } from "@/components/blog/share-buttons";
import { CommentsSection } from "@/components/blog/comments-section";
import { getPostBySlug, getPostViewCount, getRelatedPosts, getSiteSettings } from "@/lib/supabase/queries";
import { BlogCard } from "@/components/blog/blog-card";
import { AdSensePlaceholder } from "@/components/blog/adsense-placeholder";
import { ViewTracker } from "@/components/blog/view-tracker";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { ReactionButtons } from "@/components/blog/reaction-buttons";
import { CodeBlockEnhancer } from "@/components/blog/code-block-enhancer";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const settings = await getSiteSettings();

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const siteUrl = settings?.site_url || process.env.NEXT_PUBLIC_SITE_URL || "https://geckorapress.com";
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  const description = post.meta_description || post.excerpt || `Read ${post.title} on GeckoraPress`;

  const authorName = settings?.author_name || "GeckoAuthority";

  return {
    title: post.title,
    description,
    authors: [{ name: authorName }],
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: postUrl,
      images: post.cover_image ? [{ url: post.cover_image, alt: post.title }] : [],
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      authors: [authorName],
      section: post.category?.name,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.cover_image ? [post.cover_image] : [],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const settings = await getSiteSettings();

  if (!post) {
    notFound();
  }

  const viewCount = await getPostViewCount(post.id);
  const relatedPosts = post.category_id
    ? await getRelatedPosts(post.category_id, post.id, 3)
    : [];

  const siteUrl = settings?.site_url || process.env.NEXT_PUBLIC_SITE_URL || "https://geckorapress.com";
  const shareUrl = `${siteUrl}/blog/${post.slug}`;
  const authorName = settings?.author_name || "GeckoAuthority";
  const authorBio = settings?.author_bio || "";

  const readingTime = post.content ? calculateReadingTime(post.content) : (post.reading_time || 1);
  const wordCount = post.content ? post.content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.cover_image || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: settings?.site_name || "GeckoraPress",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": shareUrl,
    },
    articleSection: post.category?.name,
    wordCount,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker postId={post.id} />
      <ReadingProgress title={post.title} readingTime={readingTime} />

      <main className="flex-1 pt-[100px]">
        <article className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            <div>
              <div className="mb-6">
                <Link
                  href={`/categories/${post.category?.slug}`}
                  className="text-primary hover:text-primary/80 font-medium text-sm mb-4 inline-block"
                >
                  &larr; {post.category?.name}
                </Link>
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{post.published_at ? new Date(post.published_at).toLocaleDateString("en-US") : "Draft"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{viewCount.toLocaleString()} views</span>
                </div>
              </div>

              {post.cover_image && (
                <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                <ShareButtons url={shareUrl} title={post.title} className="mb-0" />
                <ReactionButtons postId={post.id} />
              </div>

              <Separator className="mb-8" />

              <AdSensePlaceholder format="horizontal" className="mb-8" />

              <CodeBlockEnhancer>
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </CodeBlockEnhancer>

              <div className="my-12">
                <AdSensePlaceholder format="rectangle" />
              </div>

              <Separator className="my-8" />

              {(authorName || authorBio) && (
                <div className="bg-muted/50 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{authorName}</h3>
                      {authorBio && (
                        <p className="text-muted-foreground text-sm">
                          {authorBio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <CommentsSection postId={post.id} />
            </div>

            <aside className="space-y-6">
              <div className="sticky top-[110px] space-y-6">
                <AdSensePlaceholder format="vertical" />
              </div>
            </aside>
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-12">
            <h2 className="text-2xl font-semibold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}

        <AdSensePlaceholder format="horizontal" className="max-w-6xl mx-auto" />
      </main>
    </div>
  );
}
