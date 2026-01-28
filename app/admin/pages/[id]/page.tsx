"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase/client";
import { PageEditor } from "@/components/admin/pages/page-editor";
import { useDialogs } from "@/lib/dialogs";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function EditPagePage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.id as string;
  const { confirm, showError, showSuccess } = useDialogs();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [originalSlug, setOriginalSlug] = useState("");
  const [content, setContent] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    async function fetchPage() {
      try {
        const { data, error } = await supabase
          .from("pages")
          .select("*")
          .eq("id", pageId)
          .single();

        if (error) throw error;

        setTitle(data.title);
        setSlug(data.slug);
        setOriginalSlug(data.slug);
        setContent(data.content || "");
        setMetaDescription(data.meta_description || "");
        setIsPublished(data.is_published);
      } catch (error) {
        console.error("Failed to fetch page:", error);
        router.push("/admin/pages");
      } finally {
        setLoading(false);
      }
    }

    fetchPage();
  }, [pageId, router]);

  async function handleSave() {
    if (!title.trim() || !slug.trim()) {
      showError("Title and slug are required");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("pages")
        .update({
          title: title.trim(),
          slug: slug.trim(),
          content,
          meta_description: metaDescription,
          is_published: isPublished,
        })
        .eq("id", pageId);

      if (error) throw error;
      showSuccess("Page updated successfully");
      router.push("/admin/pages");
    } catch (error: any) {
      console.error("Failed to update page:", error);
      if (error.code === "23505") {
        showError("A page with this slug already exists. Please choose a different slug.");
      } else {
        showError("Failed to update page. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Delete Page",
      description: "Are you sure you want to delete this page? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("pages")
        .delete()
        .eq("id", pageId);

      if (error) throw error;
      showSuccess("Page deleted successfully");
      router.push("/admin/pages");
    } catch (error) {
      console.error("Failed to delete page:", error);
      showError("Failed to delete page. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading page...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Edit Page</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Update page content and settings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1.5 text-red-500" />
            Delete
          </Button>
          <Button size="sm" className="h-9" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title"
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">/page/</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="page-url-slug"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
            <Label className="mb-3 block">Page Content</Label>
            <PageEditor content={content} onChange={setContent} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Publish Settings</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">Published</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Make this page visible to visitors</p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">SEO Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="meta-description">Meta Description</Label>
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Brief description for search engines..."
                className="min-h-[100px]"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {metaDescription.length}/160 characters
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
