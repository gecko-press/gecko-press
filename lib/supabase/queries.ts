import { supabase } from "./client";
import type { Category, Post, ThemeSettings } from "./types";

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("getCategories error:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("getCategories fetch error:", err);
    return [];
  }
}

export async function getHomepageCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("show_on_homepage", true)
      .order("name");

    if (error) {
      console.error("getHomepageCategories error:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("getHomepageCategories fetch error:", err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("getCategoryBySlug error:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("getCategoryBySlug fetch error:", err);
    return null;
  }
}

export async function getPosts(publishedOnly = true): Promise<Post[]> {
  try {
    let query = supabase
      .from("posts")
      .select("*, category:categories(*)")
      .order("published_at", { ascending: false });

    if (publishedOnly) {
      query = query.eq("published", true);
    }

    const { data, error } = await query;
    if (error) {
      console.error("getPosts error:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("getPosts fetch error:", err);
    return [];
  }
}

export async function getPostsByCategory(categorySlug: string): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*, category:categories!inner(*)")
      .eq("categories.slug", categorySlug)
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("getPostsByCategory error:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("getPostsByCategory fetch error:", err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*, category:categories(*)")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("getPostBySlug error:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("getPostBySlug fetch error:", err);
    return null;
  }
}

export async function getThemeSettings(): Promise<ThemeSettings | null> {
  try {
    const { data, error } = await supabase
      .from("theme_settings")
      .select("*")
      .eq("key", "global")
      .maybeSingle();

    if (error) {
      console.error("getThemeSettings error:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("getThemeSettings fetch error:", err);
    return null;
  }
}

export async function updateThemeSettings(
  settings: Partial<Omit<ThemeSettings, "id" | "key" | "updated_at">>
): Promise<ThemeSettings | null> {
  const { data, error } = await supabase
    .from("theme_settings")
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq("key", "global")
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createPost(
  post: Omit<Post, "id" | "created_at" | "updated_at" | "category">
): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select("*, category:categories(*)")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updatePost(
  id: string,
  post: Partial<Omit<Post, "id" | "created_at" | "category">>
): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .update({ ...post, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, category:categories(*)")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

export async function createCategory(
  category: Omit<Category, "id" | "created_at">
): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .insert(category)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  category: Partial<Omit<Category, "id" | "created_at">>
): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .update(category)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function getSiteSettings() {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("getSiteSettings error:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("getSiteSettings fetch error:", err);
    return null;
  }
}

export async function getPostViewCount(postId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("post_views")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (error) {
      console.error("getPostViewCount error:", error);
      return 0;
    }
    return count || 0;
  } catch (err) {
    console.error("getPostViewCount fetch error:", err);
    return 0;
  }
}

export async function getRelatedPosts(
  categoryId: string,
  currentPostId: string,
  limit = 3
): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*, category:categories(*)")
      .eq("category_id", categoryId)
      .eq("published", true)
      .neq("id", currentPostId)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getRelatedPosts error:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("getRelatedPosts fetch error:", err);
    return [];
  }
}

export async function searchPosts(query: string, limit = 20): Promise<Post[]> {
  if (!query.trim()) return [];

  try {
    const searchTerm = `%${query.trim()}%`;

    const { data, error } = await supabase
      .from("posts")
      .select("*, category:categories(*)")
      .eq("published", true)
      .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm},content.ilike.${searchTerm}`)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("searchPosts error:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("searchPosts fetch error:", err);
    return [];
  }
}
