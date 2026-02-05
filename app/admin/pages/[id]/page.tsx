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
import { useTranslations } from "next-intl";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function EditPagePage() {
  const t = useTranslations("admin.pages.edit");
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
      showError(t("required_error"));
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
      showSuccess(t("update_success"));
      router.push("/admin/pages");
    } catch (error) {
      console.error("Failed to update page:", error);
      if (error instanceof Object && "code" in error && error.code === "23505") {
        showError(t("slug_exists_error"));
      } else {
        showError(t("update_error"));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: t("delete_title"),
      description: t("delete_description"),
      confirmText: t("delete_confirm"),
      cancelText: t("delete_cancel"),
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("pages")
        .delete()
        .eq("id", pageId);

      if (error) throw error;
      showSuccess(t("delete_success"));
      router.push("/admin/pages");
    } catch (error) {
      console.error("Failed to delete page:", error);
      showError(t("delete_error"));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("loading")}</p>
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
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t("description")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1.5 text-red-500" />
            {t("delete")}
          </Button>
          <Button size="sm" className="h-9" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? t("saving") : t("save_changes")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("label_title")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("placeholder_title")}
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t("label_slug")}</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">/page/</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder={t("placeholder_slug")}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
            <Label className="mb-3 block">{t("label_content")}</Label>
            <PageEditor content={content} onChange={setContent} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{t("publish_settings")}</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{t("published")}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("make_visible")}</p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{t("seo_settings")}</h3>
            <div className="space-y-2">
              <Label htmlFor="meta-description">{t("label_meta")}</Label>
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder={t("placeholder_meta")}
                className="min-h-[100px]"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {metaDescription.length}/160 {t("characters")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
