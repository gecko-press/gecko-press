"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { MessageSquare, Send, Loader2, X } from "lucide-react";

type CommentFormProps = {
  postId: string;
  parentId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  isReply?: boolean;
};

export function CommentForm({ postId, parentId = null, onSuccess, onCancel, isReply = false }: CommentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: submitError } = await supabase.from("comments").insert({
        post_id: postId,
        parent_id: parentId,
        author_name: name.trim(),
        author_email: email.trim(),
        content: content.trim(),
      });

      if (submitError) throw submitError;

      setSuccess(true);
      setName("");
      setEmail("");
      setContent("");
      onSuccess?.();
    } catch (err) {
      setError("Failed to submit comment. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <p className="text-sm text-green-700 dark:text-green-400">
          Thank you for your comment! It will appear after moderation.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => setSuccess(false)}
        >
          Write another comment
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={isReply ? "mt-4" : ""}>
      <div className={`bg-card border rounded-lg p-4 ${isReply ? "ml-8" : ""}`}>
        {!isReply && (
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Leave a Comment</h3>
          </div>
        )}

        {isReply && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Write a reply</span>
            {onCancel && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Textarea
            placeholder="Write your comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={loading}
            rows={isReply ? 3 : 4}
          />

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            {isReply && onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" size="sm" disabled={loading || !name || !email || !content}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  {isReply ? "Reply" : "Submit Comment"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
