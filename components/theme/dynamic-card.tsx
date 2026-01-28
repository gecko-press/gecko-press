"use client";

import { useThemeConfig } from "@/lib/theme/context";
import { CardClassic, CardModern } from "./cards";
import type { CardVariantId } from "@/lib/theme/registry";
import type { Post } from "@/lib/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

const cardComponents: Record<CardVariantId, React.ComponentType<{ post: Post }>> = {
  classic: CardClassic,
  modern: CardModern,
};

function CardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border bg-card">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-[80%]" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

interface DynamicCardProps {
  post: Post;
}

export function DynamicCard({ post }: DynamicCardProps) {
  const { config, isReady } = useThemeConfig();

  if (!isReady) {
    return <CardSkeleton />;
  }

  const CardComponent = cardComponents[config.cardVariant];
  return <CardComponent post={post} />;
}

export { CardSkeleton };
