import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/lib/supabase/types";

interface CardClassicProps {
  post: Post;
}

export function CardClassic({ post }: CardClassicProps) {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      })
    : "";

  const categoryName = post.category?.name || "Uncategorized";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg bg-card border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden">
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-4xl font-bold text-primary/30">G</span>
          </div>
        )}
      </Link>

      <div className="flex flex-col p-4 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="rounded-full text-xs px-2 py-0">
            {categoryName}
          </Badge>
        </div>

        <Link href={`/blog/${post.slug}`} title={post.title} className="block overflow-hidden">
          <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate mb-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          {formattedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{post.reading_time} min</span>
          </div>
        </div>
      </div>
    </article>
  );
}
