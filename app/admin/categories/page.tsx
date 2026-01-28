"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  FolderOpen,
  Smartphone,
  Bot,
  Headphones,
  Gamepad2,
  Laptop,
  Tv,
  Watch,
  Camera,
  Folder,
  Car,
  Plane,
  Home,
  Music,
  Film,
  Book,
  Shirt,
  Heart,
  Star,
  Zap,
  Globe,
  ShoppingBag,
  Coffee,
  Utensils,
  Dumbbell,
  Palette,
  Code,
  Eye,
  EyeOff,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase/client";
import { useDialogs } from "@/lib/dialogs";
import type { Category } from "@/lib/supabase/types";
import { Pagination } from "@/components/admin/pagination";

const ITEMS_PER_PAGE = 10;

const iconMap: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  bot: Bot,
  headphones: Headphones,
  "gamepad-2": Gamepad2,
  laptop: Laptop,
  tv: Tv,
  watch: Watch,
  camera: Camera,
  folder: Folder,
  car: Car,
  plane: Plane,
  home: Home,
  music: Music,
  film: Film,
  book: Book,
  shirt: Shirt,
  heart: Heart,
  star: Star,
  zap: Zap,
  globe: Globe,
  "shopping-bag": ShoppingBag,
  coffee: Coffee,
  utensils: Utensils,
  dumbbell: Dumbbell,
  palette: Palette,
  code: Code,
};

const iconOptions = Object.keys(iconMap);

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  show_on_homepage: boolean;
}

interface CategoryFormProps {
  form: CategoryFormData;
  setForm: (form: CategoryFormData) => void;
  isNew?: boolean;
  onCancel: () => void;
  onSave: () => void;
}

function CategoryForm({ form, setForm, isNew, onCancel, onSave }: CategoryFormProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value, ...(isNew ? { slug: generateSlug(e.target.value) } : {}) })}
          placeholder="Category name"
          autoFocus={isNew}
        />
        <Input
          type="text"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="url-slug"
        />
      </div>
      <Textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description (optional)"
        rows={2}
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap max-w-md">
          {iconOptions.map((icon) => {
            const IconComponent = iconMap[icon];
            return (
              <button
                key={icon}
                type="button"
                onClick={() => setForm({ ...form, icon })}
                title={icon}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${form.icon === icon
                    ? "bg-primary text-primary-foreground"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
              >
                <IconComponent className="w-4 h-4" />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Switch
              checked={form.show_on_homepage}
              onCheckedChange={(checked) => setForm({ ...form, show_on_homepage: checked })}
            />
            Show on homepage
          </label>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" className="h-8" onClick={onSave}>
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { confirm, showError, showSuccess } = useDialogs();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "folder", show_on_homepage: true });
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.name) return;

    try {
      const { error } = await supabase.from("categories").insert({
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        description: form.description,
        icon: form.icon,
        show_on_homepage: form.show_on_homepage,
      });

      if (error) throw error;
      setShowNew(false);
      setForm({ name: "", slug: "", description: "", icon: "folder", show_on_homepage: true });
      showSuccess("Category created successfully");
      fetchCategories();
    } catch (error) {
      console.error("Failed to create category:", error);
      showError("Failed to create category. It may already exist.");
    }
  }

  async function handleUpdate(id: string) {
    if (!form.name) return;

    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: form.name,
          slug: form.slug,
          description: form.description,
          icon: form.icon,
          show_on_homepage: form.show_on_homepage,
        })
        .eq("id", id);

      if (error) throw error;
      setEditingId(null);
      setForm({ name: "", slug: "", description: "", icon: "folder", show_on_homepage: true });
      showSuccess("Category updated successfully");
      fetchCategories();
    } catch (error) {
      console.error("Failed to update category:", error);
      showError("Failed to update category.");
    }
  }

  async function toggleHomepageVisibility(category: Category) {
    try {
      const { error } = await supabase
        .from("categories")
        .update({ show_on_homepage: !category.show_on_homepage })
        .eq("id", category.id);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error("Failed to update category:", error);
      showError("Failed to update visibility.");
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await confirm({
      title: "Delete Category",
      description: "Are you sure? Posts in this category will become uncategorized.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "warning",
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      showSuccess("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      showError("Failed to delete category.");
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      show_on_homepage: category.show_on_homepage,
    });
    setShowNew(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setShowNew(false);
    setForm({ name: "", slug: "", description: "", icon: "folder", show_on_homepage: true });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Categories</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Organize your blog posts</p>
        </div>
        <Button
          size="sm"
          className="h-9"
          onClick={() => {
            setShowNew(true);
            setEditingId(null);
            setForm({ name: "", slug: "", description: "", icon: "folder", show_on_homepage: true });
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Category
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        {showNew && (
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <CategoryForm
              form={form}
              setForm={setForm}
              isNew
              onCancel={cancelEdit}
              onSave={handleCreate}
            />
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading categories...</p>
          </div>
        ) : categories.length === 0 && !showNew ? (
          <div className="p-12 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No categories yet</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setShowNew(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create your first category
            </Button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginatedCategories.map((category) => (
                <div key={category.id}>
                  {editingId === category.id ? (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50">
                      <CategoryForm
                        form={form}
                        setForm={setForm}
                        onCancel={cancelEdit}
                        onSave={() => handleUpdate(editingId)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      {(() => {
                        const CategoryIcon = iconMap[category.icon] || FolderOpen;
                        return (
                          <div className="w-9 h-9 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                            <CategoryIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                          </div>
                        );
                      })()}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{category.name}</h3>
                          {!category.show_on_homepage && (
                            <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                              <EyeOff className="w-3 h-3" />
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {category.description || `/${category.slug}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleHomepageVisibility(category)}
                          className={`p-1.5 rounded-md transition-colors ${category.show_on_homepage
                              ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                              : "text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            }`}
                          title={category.show_on_homepage ? "Visible on homepage" : "Hidden from homepage"}
                        >
                          {category.show_on_homepage ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(category)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={categories.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        )}
      </div>
    </div>
  );
}
