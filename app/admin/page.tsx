"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Eye,
  ArrowUpRight,
  Clock,
  MessageSquare,
  BarChart3,
  PenLine,
  ArrowDownToLine,
  X
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import ViewsChart from "@/components/admin/views-chart";
import { formatDistanceToNow } from "date-fns";

const VERSION_URL = "https://raw.githubusercontent.com/gecko-press/gecko-press/main/version.txt";
const RELEASES_URL = "https://github.com/gecko-press/gecko-press/releases";

type Stats = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalComments: number;
  pendingComments: number;
};

type MonthlyViews = {
  month: string;
  views: number;
};

type RecentPost = {
  id: string;
  title: string;
  published: boolean;
  created_at: string;
  post_views: { count: number }[];
};

type RecentComment = {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  is_approved: boolean;
  posts: { title: string }[] | null;
};

type UpdateInfo = {
  hasUpdate: boolean;
  latestVersion: string;
  releaseUrl: string;
  releaseNotes: string;
};

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.replace(/^v/, "").split(".").map(Number);
  const parts2 = v2.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalCategories: 0,
    totalComments: 0,
    pendingComments: 0,
  });
  const [monthlyViews, setMonthlyViews] = useState<MonthlyViews[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [recentComments, setRecentComments] = useState<RecentComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showUpdateBanner, setShowUpdateBanner] = useState(true);
  const [currentVersion, setCurrentVersion] = useState<string>("");

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const localRes = await fetch("/api/version");
        if (!localRes.ok) return;
        const { version: localVersion } = await localRes.json();
        setCurrentVersion(localVersion);

        const response = await fetch(VERSION_URL);
        if (response.ok) {
          const latestVersion = (await response.text()).trim();
          if (latestVersion && compareVersions(localVersion, latestVersion) < 0) {
            setUpdateInfo({
              hasUpdate: true,
              latestVersion,
              releaseUrl: `${RELEASES_URL}/tag/v${latestVersion}`,
              releaseNotes: "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to check for updates:", error);
      }
    }

    async function fetchData() {
      try {
        checkForUpdates();

        const [postsRes, categoriesRes, viewsRes, commentsRes, recentPostsRes, recentCommentsRes] = await Promise.all([
          supabase.from("posts").select("id, published"),
          supabase.from("categories").select("id"),
          supabase.from("post_views").select("viewed_at"),
          supabase.from("comments").select("id, is_approved"),
          supabase.from("posts").select("id, title, published, created_at, post_views(count)").order("created_at", { ascending: false }).limit(5),
          supabase.from("comments").select("id, author_name, content, created_at, is_approved, posts(title)").order("created_at", { ascending: false }).limit(5),
        ]);

        const posts = postsRes.data || [];
        const publishedPosts = posts.filter((p) => p.published).length;
        const comments = commentsRes.data || [];

        setStats({
          totalPosts: posts.length,
          publishedPosts,
          draftPosts: posts.length - publishedPosts,
          totalCategories: categoriesRes.data?.length || 0,
          totalComments: comments.length,
          pendingComments: comments.filter((c) => !c.is_approved).length,
        });

        setRecentPosts(recentPostsRes.data || []);
        setRecentComments(recentCommentsRes.data as RecentComment[] || []);

        const views = viewsRes.data || [];
        setTotalViews(views.length);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const monthlyData: MonthlyViews[] = [];

        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthViews = views.filter((v) => {
            const viewDate = new Date(v.viewed_at);
            return viewDate.getFullYear() === date.getFullYear() && viewDate.getMonth() === date.getMonth();
          }).length;

          monthlyData.push({
            month: monthNames[date.getMonth()],
            views: monthViews,
          });
        }

        setMonthlyViews(monthlyData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statCards = [
    {
      label: "Total Posts",
      value: stats.totalPosts,
      icon: FileText,
      href: "/admin/posts",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      label: "Published",
      value: stats.publishedPosts,
      icon: Eye,
      href: "/admin/posts?status=published",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      label: "Drafts",
      value: stats.draftPosts,
      icon: PenLine,
      href: "/admin/posts?status=draft",
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-8">

      {updateInfo?.hasUpdate && showUpdateBanner && (
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-4 shadow-lg mx-2 md:mx-0">
          {/* Kapatma Butonu */}
          <button
            onClick={() => setShowUpdateBanner(false)}
            className="absolute top-2 right-2 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-2.5 bg-white/20 rounded-lg shrink-0 hidden sm:block">
              <ArrowDownToLine className="w-5 h-5" />
            </div>

            {/* Metin İçeriği */}
            <div className="flex-1 pr-6 sm:pr-0">
              <h3 className="font-semibold text-sm sm:text-base">
                GeckoPress {updateInfo.latestVersion} is available!
              </h3>
              <p className="text-white/80 text-xs mt-0.5 leading-relaxed">
                You are running version {currentVersion}. Update to get the latest features.
              </p>
            </div>

            {/* Aksiyon Butonu - Mobilde tam genişlik */}
            <a
              href={updateInfo.releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 bg-white text-emerald-600 text-sm font-bold rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              View Release
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Welcome back</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Track your content performance and engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${card.iconBg}`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                {loading ? (
                  <span className="inline-block w-12 h-8 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Analytics Overview</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Last 12 months performance</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {loading ? "-" : totalViews.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total views</p>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading analytics...</p>
                </div>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ViewsChart data={monthlyViews} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Comments</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {stats.pendingComments > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">{stats.pendingComments} pending</span>
                  )}
                  {stats.pendingComments === 0 && "All caught up"}
                </p>
              </div>
            </div>
            <Link href="/admin/comments" className="text-xs text-primary hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-24" />
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : recentComments.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No comments yet</p>
              </div>
            ) : (
              recentComments.slice(0, 4).map((comment) => (
                <div key={comment.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold flex-shrink-0">
                      {comment.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {comment.author_name}
                        </span>
                        {!comment.is_approved && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-1">
                        {comment.content}
                      </p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent Posts</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Your latest content</p>
            </div>
          </div>
          <Link href="/admin/posts" className="text-xs text-primary hover:underline font-medium">
            View all
          </Link>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-64" />
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse w-32" />
                  </div>
                  <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : recentPosts.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No posts yet</p>
              <Link href="/admin/posts/new" className="text-sm text-primary hover:underline mt-2 inline-block">
                Create your first post
              </Link>
            </div>
          ) : (
            recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}`}
                className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.post_views?.[0]?.count || 0}
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${post.published
                  ? "bg-primary/10 text-primary"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}>
                  {post.published ? "Published" : "Draft"}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
