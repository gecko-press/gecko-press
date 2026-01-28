"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

interface ViewTrackerProps {
  postId: string;
}

const VIEW_STORAGE_KEY = "viewed_posts";
const VIEW_EXPIRY_HOURS = 24;

function hasViewedRecently(postId: string): boolean {
  if (typeof window === "undefined") return true;

  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (!stored) return false;

    const viewedPosts: Record<string, number> = JSON.parse(stored);
    const viewedAt = viewedPosts[postId];

    if (!viewedAt) return false;

    const hoursSinceView = (Date.now() - viewedAt) / (1000 * 60 * 60);
    return hoursSinceView < VIEW_EXPIRY_HOURS;
  } catch {
    return false;
  }
}

function markAsViewed(postId: string): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    const viewedPosts: Record<string, number> = stored ? JSON.parse(stored) : {};

    const now = Date.now();
    const cutoff = now - VIEW_EXPIRY_HOURS * 60 * 60 * 1000;

    Object.keys(viewedPosts).forEach((key) => {
      if (viewedPosts[key] < cutoff) {
        delete viewedPosts[key];
      }
    });

    viewedPosts[postId] = now;
    localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(viewedPosts));
  } catch {
    // Ignore localStorage errors
  }
}

export function ViewTracker({ postId }: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !postId) return;
    tracked.current = true;

    if (hasViewedRecently(postId)) return;

    const trackView = async () => {
      try {
        await supabase.from("post_views").insert({ post_id: postId });
        markAsViewed(postId);
      } catch (error) {
        console.error("Failed to track view:", error);
      }
    };

    trackView();
  }, [postId]);

  return null;
}
