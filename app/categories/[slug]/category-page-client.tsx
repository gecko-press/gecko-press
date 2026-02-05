"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronLeft, Smartphone, Bot, Headphones, Gamepad2, Tag, FileText, PenLine } from "lucide-react";
import { CategoryPostsGrid } from "@/components/blog/category-posts-grid";
import type { Category, Post } from "@/lib/supabase/types";

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

interface CategoryPageClientProps {
  category: Category;
  posts: Post[];
  otherCategories: Category[];
}

export function CategoryPageClient({ category, posts, otherCategories }: CategoryPageClientProps) {
  const t = useTranslations("categorySection");

  return (
    <div className="pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("all_categories")}
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {getCategoryIcon(category.icon)}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground">
              {posts.length === 1
                ? t("article_count", { count: posts.length })
                : t("articles_count", { count: posts.length })}
            </p>
          </div>
        </div>

        <p className="text-lg text-muted-foreground mb-10 max-w-3xl">
          {category.description || t("explore_collection", { category: category.name })}
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
                  {t("coming_soon")}
                </h3>
                <p className="text-muted-foreground text-center max-w-sm mb-6">
                  {t("preparing_content", { category: category.name })}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
                  <PenLine className="w-4 h-4" />
                  <span>{t("articles_in_progress")}</span>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="sticky top-[110px] space-y-6">
              {otherCategories.length > 0 && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">{t("other_categories")}</h3>
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
