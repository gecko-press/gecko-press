"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { CommentForm } from "./comment-form";
import { CommentList } from "./comment-list";
import type { Comment } from "@/lib/supabase/types";

type CommentsSectionProps = {
  postId: string;
};

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .eq("is_approved", true)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const commentsData = data || [];
      const rootComments: Comment[] = [];
      const repliesMap = new Map<string, Comment[]>();

      commentsData.forEach((comment) => {
        if (comment.parent_id) {
          const existing = repliesMap.get(comment.parent_id) || [];
          existing.push(comment);
          repliesMap.set(comment.parent_id, existing);
        } else {
          rootComments.push(comment);
        }
      });

      rootComments.forEach((comment) => {
        comment.replies = repliesMap.get(comment.id) || [];
        comment.replies.forEach((reply) => {
          reply.replies = repliesMap.get(reply.id) || [];
        });
      });

      setComments(rootComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const commentCount = comments.reduce((count, comment) => {
    let total = 1;
    if (comment.replies) {
      total += comment.replies.length;
      comment.replies.forEach((reply) => {
        if (reply.replies) {
          total += reply.replies.length;
        }
      });
    }
    return count + total;
  }, 0);

  return (
    <section className="mt-12 pt-8 border-t">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5" />
        <h2 className="text-xl font-bold">
          Comments {commentCount > 0 && <span className="text-muted-foreground font-normal">({commentCount})</span>}
        </h2>
      </div>

      <div className="space-y-8">
        <CommentForm postId={postId} onSuccess={fetchComments} />

        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Loading comments...</p>
          </div>
        ) : (
          <CommentList comments={comments} postId={postId} onReplySubmit={fetchComments} />
        )}
      </div>
    </section>
  );
}
