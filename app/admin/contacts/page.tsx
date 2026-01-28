"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen, Trash2, Clock, User, MessageSquare, RefreshCw, Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const ITEMS_PER_PAGE = 10;

type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function ContactRequestsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchSubmissions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching submissions:", error);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ is_read: true })
      .eq("id", id);

    if (!error) {
      setSubmissions(submissions.map(s =>
        s.id === id ? { ...s, is_read: true } : s
      ));
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    const { error } = await supabase
      .from("contact_submissions")
      .delete()
      .eq("id", deleteId);

    if (!error) {
      setSubmissions(submissions.filter(s => s.id !== deleteId));
      if (selectedSubmission?.id === deleteId) {
        setSelectedSubmission(null);
      }
    }
    setDeleteId(null);
  }

  function openSubmission(submission: ContactSubmission) {
    setSelectedSubmission(submission);
    if (!submission.is_read) {
      markAsRead(submission.id);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }

  const filteredSubmissions = submissions.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const unreadCount = submissions.filter(s => !s.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Contact Requests
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All messages read"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSubmissions} className="h-9">
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Search by name, email or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading messages...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <MessageSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">
            {searchQuery ? "No messages match your search" : "No contact requests yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {paginatedSubmissions.map((submission) => (
            <div
              key={submission.id}
              onClick={() => openSubmission(submission)}
              className={cn(
                "flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                !submission.is_read && "bg-primary/5"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                submission.is_read
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  : "bg-primary/10 text-primary"
              )}>
                {submission.is_read ? (
                  <MailOpen className="w-5 h-5" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={cn(
                      "text-sm truncate",
                      !submission.is_read
                        ? "font-semibold text-zinc-900 dark:text-zinc-100"
                        : "font-medium text-zinc-700 dark:text-zinc-300"
                    )}>
                      {submission.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {submission.email}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                    {formatDate(submission.created_at)}
                  </span>
                </div>
                <p className={cn(
                  "text-sm mt-1 truncate",
                  !submission.is_read
                    ? "font-medium text-zinc-800 dark:text-zinc-200"
                    : "text-zinc-600 dark:text-zinc-400"
                )}>
                  {submission.subject}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 line-clamp-1">
                  {submission.message}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 h-8 w-8 p-0 text-zinc-400 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteId(submission.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredSubmissions.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      )}

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              {selectedSubmission?.subject}
            </DialogTitle>
            <DialogDescription>
              From {selectedSubmission?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <User className="w-4 h-4" />
                  <span>{selectedSubmission.name}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Mail className="w-4 h-4" />
                  <a
                    href={`mailto:${selectedSubmission.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    {selectedSubmission.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date(selectedSubmission.created_at).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {selectedSubmission.message}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeleteId(selectedSubmission.id);
                    setSelectedSubmission(null);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
