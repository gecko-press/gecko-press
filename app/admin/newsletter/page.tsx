"use client";

import { useEffect, useState } from "react";
import { Mail, Trash2, RefreshCw, Search, Users, Download, UserMinus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/admin/pagination";

const ITEMS_PER_PAGE = 15;

type Subscriber = {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
};

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  async function fetchSubscribers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });

    if (!error && data) {
      setSubscribers(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function toggleActive(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (!error) {
      setSubscribers(subscribers.map(s =>
        s.id === id ? { ...s, is_active: !currentStatus } : s
      ));
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", deleteId);

    if (!error) {
      setSubscribers(subscribers.filter(s => s.id !== deleteId));
    }
    setDeleteId(null);
  }

  function exportEmails() {
    const activeEmails = subscribers
      .filter(s => s.is_active)
      .map(s => s.email)
      .join("\n");

    const blob = new Blob([activeEmails], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const filteredSubscribers = subscribers.filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" ||
      (filter === "active" && s.is_active) ||
      (filter === "inactive" && !s.is_active);
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredSubscribers.length / ITEMS_PER_PAGE);
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter]);

  const activeCount = subscribers.filter(s => s.is_active).length;
  const inactiveCount = subscribers.filter(s => !s.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Newsletter Subscribers
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {activeCount} active, {inactiveCount} inactive
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportEmails}
            className="h-9"
            disabled={activeCount === 0}
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchSubscribers} className="h-9">
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                filter === f
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading subscribers...</p>
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Users className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">
            {searchQuery ? "No subscribers match your search" : "No newsletter subscribers yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {paginatedSubscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className={cn(
                  "flex items-center gap-4 p-4 transition-colors",
                  !subscriber.is_active && "opacity-60"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  subscriber.is_active
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                )}>
                  <Mail className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {subscriber.email}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Subscribed {formatDate(subscriber.subscribed_at)}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0",
                      subscriber.is_active
                        ? "text-zinc-400 hover:text-amber-500"
                        : "text-zinc-400 hover:text-green-500"
                    )}
                    onClick={() => toggleActive(subscriber.id, subscriber.is_active)}
                    title={subscriber.is_active ? "Deactivate" : "Activate"}
                  >
                    {subscriber.is_active ? (
                      <UserMinus className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-zinc-400 hover:text-red-500"
                    onClick={() => setDeleteId(subscriber.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredSubscribers.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Subscriber</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this subscriber? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
