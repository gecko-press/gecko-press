import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getIpHash, checkRateLimit } from "@/lib/utils/rate-limit";
import { z } from "zod";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 5;

const emailSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
});

export async function POST(request: NextRequest) {
  try {
    const ipHash = getIpHash(request);
    const { allowed } = checkRateLimit(`newsletter:${ipHash}`, MAX_REQUESTS, WINDOW_MS);

    if (!allowed) {
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = emailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "validation_failed" },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: validation.data.email });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "duplicate" },
          { status: 409 }
        );
      }
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
