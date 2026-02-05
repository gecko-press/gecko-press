"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";

interface ReactionButtonsProps {
  postId: string;
  className?: string;
}

interface ReactionData {
  type: string;
  emoji: string;
  total: number;
  hasReacted: boolean;
}

const REACTION_TYPES = [
  { type: "clap", emoji: "\u{1F44F}" },
  { type: "heart", emoji: "\u2764\uFE0F" },
  { type: "fire", emoji: "\u{1F525}" },
  { type: "rocket", emoji: "\u{1F680}" },
  { type: "thinking", emoji: "\u{1F914}" },
];

function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("reaction_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("reaction_session_id", sessionId);
  }
  return sessionId;
}

export function ReactionButtons({ postId, className }: ReactionButtonsProps) {
  const [reactions, setReactions] = useState<ReactionData[]>(
    REACTION_TYPES.map((r) => ({ ...r, total: 0, hasReacted: false }))
  );
  const [sessionId, setSessionId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReactions = useCallback(async () => {
    const sid = getSessionId();
    setSessionId(sid);

    try {
      const params = new URLSearchParams({ postId });
      if (sid) params.set("sessionId", sid);

      const res = await fetch(`/api/reactions?${params.toString()}`);
      if (!res.ok) return;

      const { totals, userReaction } = await res.json();

      setReactions(
        REACTION_TYPES.map((rt) => ({
          ...rt,
          total: totals[rt.type] || 0,
          hasReacted: userReaction === rt.type,
        }))
      );
    } catch {
      // silent fail
    }
  }, [postId]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const handleReaction = async (reactionType: string) => {
    if (!sessionId || isSubmitting) return;
    setIsSubmitting(true);

    const currentReaction = reactions.find((r) => r.hasReacted);

    if (currentReaction?.type === reactionType) {
      setReactions((prev) =>
        prev.map((r) =>
          r.type === reactionType
            ? { ...r, total: Math.max(0, r.total - 1), hasReacted: false }
            : r
        )
      );

      try {
        await fetch("/api/reactions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, sessionId }),
        });
      } catch {
        fetchReactions();
      }
    } else {
      setReactions((prev) =>
        prev.map((r) => {
          if (r.type === reactionType) {
            return { ...r, total: r.total + 1, hasReacted: true };
          }
          if (r.hasReacted) {
            return { ...r, total: Math.max(0, r.total - 1), hasReacted: false };
          }
          return r;
        })
      );

      try {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, reactionType, sessionId }),
        });

        if (!res.ok) {
          fetchReactions();
        }
      } catch {
        fetchReactions();
      }
    }

    setOpen(false);
    setIsSubmitting(false);
  };

  const userReaction = reactions.find((r) => r.hasReacted);
  const totalReactions = reactions.reduce((sum, r) => sum + r.total, 0);

  const ReactionButtonsList = () => (
    <>
      {reactions.map((reaction) => (
        <button
          key={reaction.type}
          onClick={() => handleReaction(reaction.type)}
          disabled={isSubmitting}
          className={cn(
            "flex items-center justify-center gap-1 h-8 px-2 rounded-md border text-sm transition-colors",
            reaction.hasReacted
              ? "border-2 border-primary bg-primary/10"
              : "border-border hover:bg-muted",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="text-base">{reaction.emoji}</span>
          {reaction.total > 0 && (
            <span className="text-xs text-muted-foreground">
              {reaction.total}
            </span>
          )}
        </button>
      ))}
    </>
  );

  return (
    <div className={cn("flex items-center", className)}>
      <div className="hidden md:flex items-center gap-1.5">
        <ReactionButtonsList />
      </div>

      <div className="md:hidden">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center justify-center gap-1.5 h-8 px-3 rounded-md border text-sm transition-colors",
                userReaction
                  ? "border-2 border-primary bg-primary/10"
                  : "border-border hover:bg-muted"
              )}
            >
              {userReaction ? (
                <span className="text-base">{userReaction.emoji}</span>
              ) : (
                <SmilePlus className="w-4 h-4" />
              )}
              {totalReactions > 0 && (
                <span className="text-xs text-muted-foreground">
                  {totalReactions}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="end">
            <div className="flex items-center gap-1.5">
              <ReactionButtonsList />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
