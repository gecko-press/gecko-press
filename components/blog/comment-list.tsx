"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Reply, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentForm } from "./comment-form";
import type { Comment } from "@/lib/supabase/types";

type CommentItemProps = {
  comment: Comment;
  postId: string;
  onReplySubmit: () => void;
  depth?: number;
};

function CommentItem({ comment, postId, onReplySubmit, depth = 0 }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const maxDepth = 2;

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className={depth > 0 ? "ml-8 mt-4" : ""}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium text-primary">{getInitials(comment.author_name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{comment.author_name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{comment.content}</p>

          {depth < maxDepth && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <Reply className="w-3.5 h-3.5 mr-1" />
              Reply
            </Button>
          )}
        </div>
      </div>

      {showReplyForm && (
        <CommentForm
          postId={postId}
          parentId={comment.id}
          isReply
          onSuccess={() => {
            setShowReplyForm(false);
            onReplySubmit();
          }}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="border-l-2 border-muted pl-0">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReplySubmit={onReplySubmit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type CommentListProps = {
  comments: Comment[];
  postId: string;
  onReplySubmit: () => void;
};

export function CommentList({ comments, postId, onReplySubmit }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg">
        <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          onReplySubmit={onReplySubmit}
        />
      ))}
    </div>
  );
}
