"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, EyeOff, ExternalLink, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useDialogs } from "@/lib/dialogs";
import type { Post } from "@/lib/supabase/types";

type PostWithViews = Post & { views_count: number };
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/admin/pagination";

const ITEMS_PER_PAGE = 10;

export default function PostsPage() {
  const { confirm, showSuccess, showError } = useDialogs();
  const [posts, setPosts] = useState<PostWithViews[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*, category:categories(*)")
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      const { data: viewsData, error: viewsError } = await supabase
        .from("post_views")
        .select("post_id");

      if (viewsError) throw viewsError;

      const viewCounts = (viewsData || []).reduce((acc: Record<string, number>, view) => {
        acc[view.post_id] = (acc[view.post_id] || 0) + 1;
        return acc;
      }, {});

      const postsWithViews = (postsData || []).map(post => ({
        ...post,
        views_count: viewCounts[post.id] || 0,
      }));

      setPosts(postsWithViews);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(post: Post) {
    try {
      const { error } = await supabase
        .from("posts")
        .update({
          published: !post.published,
          published_at: !post.published ? new Date().toISOString() : post.published_at,
        })
        .eq("id", post.id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error("Failed to toggle publish:", error);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await confirm({
      title: "Delete Post",
      description: "Are you sure you want to delete this post? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
      showSuccess("Post deleted successfully");
      fetchPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
      showError("Failed to delete post. Please try again.");
    }
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Posts</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your blog posts</p>
        </div>
        <Link href="/admin/posts/new">
          <Button size="sm" className="h-9">
            <Plus className="w-4 h-4 mr-1.5" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
        <Input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {search ? "No posts match your search" : "No posts yet"}
            </p>
            {!search && (
              <Link href="/admin/posts/new" className="inline-block mt-3">
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create your first post
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginatedPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm font-medium text-zinc-400">G</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${post.published
                            ? 'bg-emerald-500'
                            : 'bg-zinc-400 dark:bg-zinc-600'
                          }`}
                        title={post.published ? 'Published' : 'Draft'}
                      />
                      <Link href={`/admin/posts/${post.id}`} className="font-medium text-sm text-zinc-900 dark:text-zinc-100 hover:underline truncate">
                        {post.title}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {post.category && (
                        <>
                          <span>{post.category.name}</span>
                          <span className="text-zinc-300 dark:text-zinc-600">|</span>
                        </>
                      )}
                      <span>
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-600">|</span>
                      <span className="flex items-center gap-1">
                        <BarChart2 className="w-3 h-3" />
                        {post.views_count.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/posts/${post.id}`} className="cursor-pointer">
                          <Pencil className="w-3.5 h-3.5 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      {post.published && (
                        <DropdownMenuItem asChild>
                          <Link href={`/blog/${post.slug}`} target="_blank" className="cursor-pointer">
                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => togglePublish(post)} className="cursor-pointer">
                        {post.published ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 dark:focus:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredPosts.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        )}
      </div>
    </div>
  );
}
