"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Check,
  X,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { Pagination } from "@/components/admin/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Comment } from "@/lib/supabase/types";

const ITEMS_PER_PAGE = 10;

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchComments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("*, post:posts(id, title, slug)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchComments();
  }, []);

  async function approveComment(id: string) {
    const { error } = await supabase
      .from("comments")
      .update({ is_approved: true })
      .eq("id", id);

    if (!error) {
      setComments(comments.map(c => c.id === id ? { ...c, is_approved: true } : c));
    }
  }

  async function rejectComment(id: string) {
    const { error } = await supabase
      .from("comments")
      .update({ is_approved: false })
      .eq("id", id);

    if (!error) {
      setComments(comments.map(c => c.id === id ? { ...c, is_approved: false } : c));
    }
  }

  async function deleteComment() {
    if (!deleteId) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", deleteId);

    if (!error) {
      setComments(comments.filter(c => c.id !== deleteId));
    }
    setDeleteId(null);
  }

  const filteredComments = comments.filter(c => {
    const matchesSearch =
      c.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.author_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "pending" && !c.is_approved) ||
      (filterStatus === "approved" && c.is_approved);

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredComments.length / ITEMS_PER_PAGE);
  const paginatedComments = filteredComments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const pendingCount = comments.filter(c => !c.is_approved).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Comments</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {pendingCount > 0 ? `${pendingCount} pending approval` : "All comments moderated"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchComments} className="h-9">
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search by name, email or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v: "all" | "pending" | "approved") => setFilterStatus(v)}>
          <SelectTrigger className="w-full sm:w-[160px] h-10">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Comments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading comments...</p>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <MessageSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">
            {searchQuery || filterStatus !== "all" ? "No comments match your criteria" : "No comments yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {paginatedComments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "p-4 transition-colors",
                  !comment.is_approved && "bg-amber-50/50 dark:bg-amber-950/20"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                    comment.is_approved
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                      : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400"
                  )}>
                    {comment.author_name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                        {comment.author_name}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {comment.author_email}
                      </span>
                      {!comment.is_approved && (
                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-[10px] font-medium rounded">
                          Pending
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-2 line-clamp-2">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                      {comment.post && (
                        <Link
                          href={`/blog/${comment.post.slug}`}
                          target="_blank"
                          className="flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {comment.post.title}
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!comment.is_approved ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                        onClick={() => approveComment(comment.id)}
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950"
                        onClick={() => rejectComment(comment.id)}
                        title="Unapprove"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => setDeleteId(comment.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredComments.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteComment} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
