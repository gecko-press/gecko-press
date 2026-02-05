import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { commentFormSchema } from "@/lib/validations/forms";
import { getIpHash, checkRateLimit } from "@/lib/utils/rate-limit";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;

export async function POST(request: NextRequest) {
  try {
    const ipHash = getIpHash(request);
    const { allowed } = checkRateLimit(`comment:${ipHash}`, MAX_REQUESTS, WINDOW_MS);

    if (!allowed) {
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = commentFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "validation_failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase
      .from("comments")
      .insert({
        post_id: validation.data.post_id,
        parent_id: validation.data.parent_id || null,
        author_name: validation.data.author_name,
        author_email: validation.data.author_email,
        content: validation.data.content,
      });

    if (insertError) {
      return NextResponse.json(
        { error: "insert_failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "invalid_request" },
      { status: 400 }
    );
  }
}
