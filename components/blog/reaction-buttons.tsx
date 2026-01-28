"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
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
  { type: "clap", emoji: "👏" },
  { type: "heart", emoji: "❤️" },
  { type: "fire", emoji: "🔥" },
  { type: "rocket", emoji: "🚀" },
  { type: "thinking", emoji: "🤔" },
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

  const fetchReactions = useCallback(async () => {
    const sid = getSessionId();
    setSessionId(sid);

    const { data: allReactions } = await supabase
      .from("post_reactions")
      .select("reaction_type, session_id")
      .eq("post_id", postId);

    if (allReactions) {
      const totals: Record<string, number> = {};
      let foundUserReaction: string | null = null;

      allReactions.forEach((r) => {
        totals[r.reaction_type] = (totals[r.reaction_type] || 0) + 1;
        if (r.session_id === sid) {
          foundUserReaction = r.reaction_type;
        }
      });

      setReactions(
        REACTION_TYPES.map((rt) => ({
          ...rt,
          total: totals[rt.type] || 0,
          hasReacted: foundUserReaction === rt.type,
        }))
      );
    }
  }, [postId]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const handleReaction = async (reactionType: string) => {
    if (!sessionId) return;

    const currentReaction = reactions.find((r) => r.hasReacted);

    if (currentReaction?.type === reactionType) {
      setReactions((prev) =>
        prev.map((r) =>
          r.type === reactionType
            ? { ...r, total: Math.max(0, r.total - 1), hasReacted: false }
            : r
        )
      );

      await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("session_id", sessionId);
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

      if (currentReaction) {
        await supabase
          .from("post_reactions")
          .delete()
          .eq("post_id", postId)
          .eq("session_id", sessionId);
      }

      await supabase.from("post_reactions").insert({
        post_id: postId,
        reaction_type: reactionType,
        session_id: sessionId,
        count: 1,
      });
    }

    setOpen(false);
  };

  const userReaction = reactions.find((r) => r.hasReacted);
  const totalReactions = reactions.reduce((sum, r) => sum + r.total, 0);

  const ReactionButtonsList = () => (
    <>
      {reactions.map((reaction) => (
        <button
          key={reaction.type}
          onClick={() => handleReaction(reaction.type)}
          className={cn(
            "flex items-center justify-center gap-1 h-8 px-2 rounded-md border text-sm transition-colors",
            reaction.hasReacted
              ? "border-2 border-primary bg-primary/10"
              : "border-border hover:bg-muted"
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
