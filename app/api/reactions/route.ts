import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getIpHash } from "@/lib/utils/rate-limit";

const VALID_REACTION_TYPES = ["clap", "heart", "fire", "rocket", "thinking"];
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REACTIONS_PER_WINDOW = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  const sessionId = searchParams.get("sessionId");

  if (!postId) {
    return NextResponse.json({ error: "postId required" }, { status: 400 });
  }

  const { data: allReactions } = await supabase
    .from("post_reactions")
    .select("reaction_type, session_id")
    .eq("post_id", postId);

  const totals: Record<string, number> = {};
  let userReaction: string | null = null;

  (allReactions || []).forEach((r) => {
    totals[r.reaction_type] = (totals[r.reaction_type] || 0) + 1;
    if (sessionId && r.session_id === sessionId) {
      userReaction = r.reaction_type;
    }
  });

  return NextResponse.json({ totals, userReaction });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, reactionType, sessionId } = body;

    if (!postId || !reactionType || !sessionId) {
      return NextResponse.json(
        { error: "postId, reactionType, and sessionId are required" },
        { status: 400 }
      );
    }

    if (!VALID_REACTION_TYPES.includes(reactionType)) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
        { status: 400 }
      );
    }

    const ipHash = getIpHash(request);

    const windowStart = new Date(
      Date.now() - RATE_LIMIT_WINDOW_MS
    ).toISOString();
    const { count } = await supabase
      .from("post_reactions")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", windowStart);

    if (count !== null && count >= MAX_REACTIONS_PER_WINDOW) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    await supabase
      .from("post_reactions")
      .delete()
      .eq("post_id", postId)
      .eq("session_id", sessionId);

    const { error: insertError } = await supabase
      .from("post_reactions")
      .insert({
        post_id: postId,
        reaction_type: reactionType,
        session_id: sessionId,
        ip_hash: ipHash,
        count: 1,
      });

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to save reaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, sessionId } = body;

    if (!postId || !sessionId) {
      return NextResponse.json(
        { error: "postId and sessionId are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("post_reactions")
      .delete()
      .eq("post_id", postId)
      .eq("session_id", sessionId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to remove reaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
