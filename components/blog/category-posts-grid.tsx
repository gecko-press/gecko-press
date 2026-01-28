"use client";

import { useState } from "react";
import { DynamicCard } from "@/components/theme/dynamic-card";
import { BlogPagination } from "@/components/blog/pagination";
import type { Post } from "@/lib/supabase/types";

const POSTS_PER_PAGE = 6;

interface CategoryPostsGridProps {
  posts: Post[];
}

export function CategoryPostsGrid({ posts }: CategoryPostsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">
          No articles found in this category yet.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {paginatedPosts.map((post) => (
          <DynamicCard key={post.id} post={post} />
        ))}
      </div>
      <BlogPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
