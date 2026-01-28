"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/blog-card";
import { supabase } from "@/lib/supabase/client";
import type { Post } from "@/lib/supabase/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const searchTerm = `%${searchQuery.trim()}%`;
      const { data, error } = await supabase
        .from("posts")
        .select("*, category:categories(*)")
        .eq("published", true)
        .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},content.ilike.${searchTerm}`)
        .order("published_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    router.push("/search");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-32">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Search Articles</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find articles by title, content, or keywords
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles..."
              className="pl-12 pr-24 h-14 text-lg rounded-full border-2 focus:border-primary"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-24 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : searched ? (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                {results.length === 0
                  ? `No results found for "${initialQuery}"`
                  : `Found ${results.length} result${results.length !== 1 ? "s" : ""} for "${initialQuery}"`}
              </p>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-4">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Start searching</h3>
            <p className="text-muted-foreground">
              Enter a keyword to find articles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
