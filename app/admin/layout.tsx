"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, FolderOpen, FileStack, MessageSquare, MessagesSquare, Settings, ExternalLink, Menu, X, ChevronRight, LogOut, Loader2, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/pages", label: "Pages", icon: FileStack },
  { href: "/admin/comments", label: "Comments", icon: MessagesSquare, showCommentBadge: true },
  { href: "/admin/contacts", label: "Contact Requests", icon: MessageSquare, showBadge: true },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingComments, setPendingComments] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchUnreadCount() {
      const { count } = await supabase
        .from("contact_submissions")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);
      setUnreadCount(count || 0);
    }

    async function fetchPendingComments() {
      const { count } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false);
      setPendingComments(count || 0);
    }

    fetchUnreadCount();
    fetchPendingComments();

    const contactChannel = supabase
      .channel("contact_submissions_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_submissions" },
        () => fetchUnreadCount()
      )
      .subscribe();

    const commentsChannel = supabase
      .channel("comments_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => fetchPendingComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contactChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user]);

  const currentPage = navItems.find(item =>
    pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
  );

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Yukleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Yonlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-background/80">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <Menu className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-60 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/admin" className="flex items-center gap-2">
            <img src="/geckopress-logo.svg" alt="GeckoPress" className="h-8" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-3.5rem)] justify-between">
          <nav className="p-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              const showBadge = item.showBadge && unreadCount > 0;
              const showCommentBadge = item.showCommentBadge && pendingComments > 0;
              const badgeCount = item.showBadge ? unreadCount : item.showCommentBadge ? pendingComments : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {(showBadge || showCommentBadge) && (
                    <span className={cn(
                      "min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-semibold rounded-full",
                      item.showCommentBadge ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                    )}>
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Site
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center gap-2 text-sm ml-12 lg:ml-0">
              <span className="text-zinc-400">Admin</span>
              {currentPage && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{currentPage.label}</span>
                </>
              )}
            </div>
            <div className="text-xs text-zinc-400 truncate max-w-[200px]">
              {user.email}
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
