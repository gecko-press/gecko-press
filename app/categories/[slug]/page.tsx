import { Metadata } from "next";
import { CategoryPostsGrid } from "@/components/blog/category-posts-grid";
import { AdSensePlaceholder } from "@/components/blog/adsense-placeholder";
import { getCategories, getCategoryBySlug, getPostsByCategory, getSiteSettings } from "@/lib/supabase/queries";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Smartphone, Bot, Headphones, Gamepad2, Tag, FileText, PenLine } from "lucide-react";

export const revalidate = 60;
export const dynamicParams = true;

const iconMap: Record<string, React.ReactNode> = {
  "smartphone": <Smartphone className="w-6 h-6" />,
  "bot": <Bot className="w-6 h-6" />,
  "headphones": <Headphones className="w-6 h-6" />,
  "gamepad-2": <Gamepad2 className="w-6 h-6" />,
};

function getCategoryIcon(iconName: string | null | undefined): React.ReactNode {
  if (!iconName) return <Tag className="w-6 h-6" />;
  return iconMap[iconName.toLowerCase()] || <Tag className="w-6 h-6" />;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };

  const settings = await getSiteSettings();
  const baseUrl = settings?.site_url || process.env.NEXT_PUBLIC_SITE_URL || "https://geckopress.com";
  const categoryUrl = `${baseUrl}/categories/${slug}`;
  const description = category.description || `Explore articles about ${category.name}`;

  return {
    title: `${category.name} - GeckoPress`,
    description,
    openGraph: {
      type: "website",
      title: `${category.name} - GeckoPress`,
      description,
      url: categoryUrl,
    },
    twitter: {
      card: "summary",
      title: `${category.name} - GeckoPress`,
      description,
    },
    alternates: {
      canonical: categoryUrl,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const posts = await getPostsByCategory(slug);
  const otherCategories = allCategories.filter((cat) => cat.id !== category.id);

  return (
    <div className="pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          All Categories
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {getCategoryIcon(category.icon)}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground">
              {posts.length} {posts.length === 1 ? "article" : "articles"} available
            </p>
          </div>
        </div>

        <p className="text-lg text-muted-foreground mb-10 max-w-3xl">
          {category.description || `Explore our collection of articles about ${category.name}`}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {posts.length > 0 ? (
              <CategoryPostsGrid posts={posts} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 bg-gradient-to-br from-muted/30 to-muted/60 rounded-2xl border border-border/50">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
                  <div className="relative p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full border border-primary/20">
                    <FileText className="w-10 h-10 text-primary/70" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground/90">
                  Coming Soon
                </h3>
                <p className="text-muted-foreground text-center max-w-sm mb-6">
                  We are preparing exciting content for the <span className="font-medium text-foreground/80">{category.name}</span> category. Check back soon!
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
                  <PenLine className="w-4 h-4" />
                  <span>Articles in progress</span>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="sticky top-[110px] space-y-6">
              <AdSensePlaceholder format="vertical" />

              {otherCategories.length > 0 && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Other Categories</h3>
                  <div className="space-y-2">
                    {otherCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="p-1.5 rounded-md bg-muted">
                          {getCategoryIcon(cat.icon)}
                        </div>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
