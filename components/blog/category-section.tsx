"use client";

import Link from "next/link";
import { ArrowRight, FileText, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { DynamicCard } from "@/components/theme/dynamic-card";
import type { Category, Post } from "@/lib/supabase/types";

interface CategorySectionProps {
  category: Category;
  posts: Post[];
}

export function CategorySection({ category, posts }: CategorySectionProps) {
  const t = useTranslations("categorySection");
  const hasPosts = posts.length > 0;

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">{category.name}</h2>
          <Link
            href={`/categories/${category.slug}`}
            className="text-sm text-foreground hover:text-primary underline underline-offset-4 transition-colors flex items-center gap-1 group"
          >
            {t("view_all")}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {hasPosts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.slice(0, 3).map((post) => (
              <DynamicCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg border border-dashed border-border bg-muted/30">
            <div className="w-14 h-14 rounded-full border-2 border-primary/30 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary/70" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("coming_soon")}</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-3">
              {t("preparing_content")}{" "}
              <span className="text-foreground font-medium">{category.name}</span>{" "}
              {t("check_back_soon")}
            </p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Pencil className="w-3.5 h-3.5" />
              {t("articles_in_progress")}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
