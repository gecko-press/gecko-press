"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2, X } from "lucide-react";

type CommentFormProps = {
  postId: string;
  parentId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  isReply?: boolean;
};

export function CommentForm({ postId, parentId = null, onSuccess, onCancel, isReply = false }: CommentFormProps) {
  const t = useTranslations("comments");
  const tValidation = useTranslations("validation");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          parent_id: parentId,
          author_name: name.trim(),
          author_email: email.trim(),
          content: content.trim(),
        }),
      });

      if (res.status === 429) {
        setError(t("error_rate_limited"));
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok && data.error === "validation_failed" && data.details) {
        const errors: Record<string, string> = {};
        data.details.forEach((err: { path: string[]; message: string }) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setFieldErrors(errors);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      setName("");
      setEmail("");
      setContent("");
      onSuccess?.();
    } catch (err) {
      setError(t("error_generic"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <p className="text-sm text-green-700 dark:text-green-400">
          {t("success")}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => setSuccess(false)}
        >
          {t("write_another")}
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
            <h3 className="font-semibold">{t("title")}</h3>
          </div>
        )}

        {isReply && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">{t("reply_title")}</span>
            {onCancel && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Input
                placeholder={t("name_placeholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className={fieldErrors.author_name ? "border-red-500" : ""}
              />
              {fieldErrors.author_name && (
                <p className="text-xs text-red-600 dark:text-red-400">{tValidation(fieldErrors.author_name)}</p>
              )}
            </div>
            <div className="space-y-1">
              <Input
                type="email"
                placeholder={t("email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={fieldErrors.author_email ? "border-red-500" : ""}
              />
              {fieldErrors.author_email && (
                <p className="text-xs text-red-600 dark:text-red-400">{tValidation(fieldErrors.author_email)}</p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Textarea
              placeholder={t("content_placeholder")}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              rows={isReply ? 3 : 4}
              className={fieldErrors.content ? "border-red-500" : ""}
            />
            {fieldErrors.content && (
              <p className="text-xs text-red-600 dark:text-red-400">{tValidation(fieldErrors.content)}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            {isReply && onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                {t("cancel")}
              </Button>
            )}
            <Button type="submit" size="sm" disabled={loading || !name || !email || !content}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  {isReply ? t("reply") : t("submit")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
