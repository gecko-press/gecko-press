"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentEditor } from "@/components/admin/content-editor";
import { supabase } from "@/lib/supabase/client";
import { useDialogs } from "@/lib/dialogs";
import type { Category } from "@/lib/supabase/types";
import { calculateReadingTime } from "@/lib/utils/reading-time";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NewPostPage() {
  const router = useRouter();
  const { showError, showSuccess } = useDialogs();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    category_id: "",
    published: false,
  });

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("*").order("name");
      setCategories(data || []);
    }
    fetchCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const readingTime = calculateReadingTime(form.content);
      const { error } = await supabase.from("posts").insert({
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        cover_image: form.cover_image || null,
        category_id: form.category_id || null,
        reading_time: readingTime,
        published: form.published,
        published_at: form.published ? new Date().toISOString() : null,
      });

      if (error) throw error;
      showSuccess("Post created successfully");
      router.push("/admin/posts");
    } catch (error) {
      console.error("Failed to create post:", error);
      showError("Failed to create post. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/posts">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">New Post</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Create a new blog post</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              type="text"
              value={form.title}
              onChange={(e) => {
                setForm({
                  ...form,
                  title: e.target.value,
                  slug: generateSlug(e.target.value),
                });
              }}
              placeholder="Enter post title"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="url-friendly-slug"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={form.category_id}
              onValueChange={(value) => setForm({ ...form, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Cover Image URL</Label>
            <div className="flex gap-2">
              <Input
                type="url"
                value={form.cover_image}
                onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              {form.cover_image && (
                <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                  <img src={form.cover_image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Excerpt</Label>
            <Textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Brief description of the post"
              rows={2}
            />
          </div>

          <ContentEditor
            content={form.content}
            onContentChange={(content) => setForm({ ...form, content })}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setForm({ ...form, published: !form.published })}
            className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            {form.published ? (
              <>
                <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Will be published</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Save as draft</span>
              </>
            )}
          </button>

          <div className="flex gap-2">
            <Link href="/admin/posts">
              <Button variant="outline" type="button" size="sm" className="h-9">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saving} size="sm" className="h-9">
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? "Saving..." : "Save Post"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
