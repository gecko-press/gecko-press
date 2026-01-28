"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Menu as MenuIcon, Pencil, Trash2, Eye, EyeOff, GripVertical, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MenuManager } from "@/components/admin/pages/menu-manager";
import { Pagination } from "@/components/admin/pagination";

const ITEMS_PER_PAGE = 10;

type Page = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pages");
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(pages.length / ITEMS_PER_PAGE);
  const paginatedPages = pages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    try {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(page: Page) {
    try {
      const { error } = await supabase
        .from("pages")
        .update({ is_published: !page.is_published })
        .eq("id", page.id);

      if (error) throw error;
      setPages(pages.map(p => p.id === page.id ? { ...p, is_published: !p.is_published } : p));
    } catch (error) {
      console.error("Failed to update page:", error);
    }
  }

  async function deletePage() {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("pages")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      setPages(pages.filter(p => p.id !== deleteId));
    } catch (error) {
      console.error("Failed to delete page:", error);
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Pages & Menu</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your site pages and navigation menu
          </p>
        </div>
        {activeTab === "pages" && (
          <Link href="/admin/pages/new">
            <Button size="sm" className="h-9">
              <Plus className="w-4 h-4 mr-1.5" />
              New Page
            </Button>
          </Link>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-zinc-100 dark:bg-zinc-800">
          <TabsTrigger value="pages" className="gap-1.5">
            <FileText className="w-4 h-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="menu" className="gap-1.5">
            <MenuIcon className="w-4 h-4" />
            Menu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-sm text-zinc-500">Loading pages...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">No pages yet</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                Create your first page to get started
              </p>
              <Link href="/admin/pages/new">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create Page
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 px-4 py-3">Title</th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 px-4 py-3">Slug</th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 px-4 py-3">Status</th>
                      <th className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {paginatedPages.map((page) => (
                      <tr key={page.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{page.title}</p>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            /page/{page.slug}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                              page.is_published
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {page.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {page.is_published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => togglePublish(page)}
                              title={page.is_published ? "Unpublish" : "Publish"}
                            >
                              {page.is_published ? (
                                <EyeOff className="w-4 h-4 text-zinc-500" />
                              ) : (
                                <Eye className="w-4 h-4 text-zinc-500" />
                              )}
                            </Button>
                            <Link href={`/admin/pages/${page.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Pencil className="w-4 h-4 text-zinc-500" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setDeleteId(page.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={pages.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="menu" className="mt-4">
          <MenuManager pages={pages} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this page? This action cannot be undone.
              Any menu items linking to this page will be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deletePage} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
