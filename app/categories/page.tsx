import { Metadata } from "next";
import { getCategories, getPostsByCategory } from "@/lib/supabase/queries";
import Link from "next/link";
import Image from "next/image";
import { Smartphone, Bot, Headphones, Gamepad2, ArrowRight, Tag } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Categories - GeckoPress",
  description: "Browse all categories on GeckoPress. Find tech reviews, guides, and articles organized by topic.",
  openGraph: {
    type: "website",
    title: "Categories - GeckoPress",
    description: "Browse all categories on GeckoPress. Find tech reviews, guides, and articles organized by topic.",
  },
  twitter: {
    card: "summary",
    title: "Categories - GeckoPress",
    description: "Browse all categories on GeckoPress. Find tech reviews, guides, and articles organized by topic.",
  },
};

const iconMap: Record<string, React.ReactNode> = {
  "smartphone": <Smartphone className="w-8 h-8" />,
  "bot": <Bot className="w-8 h-8" />,
  "headphones": <Headphones className="w-8 h-8" />,
  "gamepad-2": <Gamepad2 className="w-8 h-8" />,
};

function getCategoryIcon(iconName: string | null | undefined): React.ReactNode {
  if (!iconName) return <Tag className="w-8 h-8" />;
  return iconMap[iconName.toLowerCase()] || <Tag className="w-8 h-8" />;
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  const categoriesWithPosts = await Promise.all(
    categories.map(async (category) => {
      const posts = await getPostsByCategory(category.slug);
      return { category, posts, featuredPost: posts[0] || null };
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pt-24">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse Categories
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our comprehensive guides and reviews across different tech categories
            </p>
          </div>

          {categoriesWithPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoriesWithPosts.map(({ category, posts, featuredPost }) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/20"
                >
                  <div className="aspect-[16/9] relative">
                    {featuredPost?.cover_image ? (
                      <Image
                        src={featuredPost.cover_image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white">
                        {getCategoryIcon(category.icon)}
                      </div>
                      <span className="text-sm font-medium text-white/80">
                        {posts.length} {posts.length === 1 ? "Article" : "Articles"}
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h2>

                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {category.description || `Explore articles about ${category.name}`}
                    </p>

                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <span>View Articles</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
