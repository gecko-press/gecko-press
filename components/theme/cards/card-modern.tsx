"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Post } from "@/lib/supabase/types";

interface CardModernProps {
  post: Post;
}

const localeMap: Record<string, string> = {
  tr: "tr-TR",
  en: "en-US",
};

export function CardModern({ post }: CardModernProps) {
  const locale = useLocale();
  const t = useTranslations("card");
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(localeMap[locale] || "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const categoryName = post.category?.name || t("uncategorized");

  return (
    <article className="group relative">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-4">
          {post.cover_image ? (
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              quality={70}
              className="object-cover transition-all duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 24px), 400px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-6xl font-bold text-primary/20">G</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <ArrowUpRight className="w-5 h-5 text-foreground" />
          </div>
        </div>

        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-primary font-medium">{categoryName}</span>
            {formattedDate && (
              <>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span>{formattedDate}</span>
              </>
            )}
          </div>

          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate" title={post.title}>
            {post.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-1 text-sm text-muted-foreground pt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.reading_time} {t("min_read")}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
