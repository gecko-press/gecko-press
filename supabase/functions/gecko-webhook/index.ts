import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey, X-Signature, X-Timestamp, X-Source, X-Platform, X-GeckoGen-Secret",
};

interface GeckoPayload {
  title: string;
  content_html: string;
  content_markdown?: string;
  slug: string;
  meta_description?: string;
  featured_image_url?: string;
  content_images?: Array<{ url: string; altText: string }>;
  audio_url?: string;
  youtube_video_id?: string;
  json_ld_schemas?: Array<Record<string, unknown>>;
  category_slug?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: string[];
  status?: string;
  published_at?: string;
  source?: string;
  reading_time_minutes?: number;
}

function calculateReadingTime(htmlContent: string): number {
  const textContent = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = textContent.split(" ").filter((word) => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);
  return Math.max(1, readingTime);
}

function extractExcerpt(htmlContent: string, maxLength: number = 160): string {
  const textContent = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (textContent.length <= maxLength) {
    return textContent;
  }
  return textContent.substring(0, maxLength - 3) + "...";
}

async function verifySignature(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(timestamp + payload);
  const keyData = encoder.encode(secret);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
  const expectedSignature =
    "sha256=" +
    Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  return signature === expectedSignature;
}

function verifyBearerToken(authHeader: string | null, secret: string): boolean {
  if (!authHeader) return false;
  const token = authHeader.replace("Bearer ", "");
  return token === secret;
}

function getFileExtension(url: string, contentType?: string): string {
  if (contentType) {
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "audio/mpeg": "mp3",
      "audio/mp3": "mp3",
      "audio/wav": "wav",
      "audio/ogg": "ogg",
      "audio/webm": "webm",
    };
    if (mimeToExt[contentType]) {
      return mimeToExt[contentType];
    }
  }

  const urlPath = new URL(url).pathname;
  const ext = urlPath.split(".").pop()?.toLowerCase();
  if (ext && ["jpg", "jpeg", "png", "webp", "gif", "mp3", "wav", "ogg", "webm"].includes(ext)) {
    return ext === "jpeg" ? "jpg" : ext;
  }

  return "jpg";
}

async function downloadAndUploadFile(
  supabase: SupabaseClient,
  sourceUrl: string,
  bucket: string,
  filePath: string
): Promise<string | null> {
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent": "GeckoPress/1.0",
      },
    });

    if (!response.ok) {
      console.error(`Failed to download file from ${sourceUrl}: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    const arrayBuffer = await response.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    const ext = getFileExtension(sourceUrl, contentType);
    const finalPath = filePath.includes(".") ? filePath : `${filePath}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(finalPath, fileData, {
        contentType: contentType || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      console.error(`Failed to upload file to ${bucket}/${finalPath}:`, uploadError);
      return null;
    }

    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(finalPath);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error(`Error processing file ${sourceUrl}:`, error);
    return null;
  }
}

async function processMediaFiles(
  supabase: SupabaseClient,
  slug: string,
  featuredImageUrl?: string,
  contentImages?: Array<{ url: string; altText: string }>,
  audioUrl?: string,
  existingContent?: string
): Promise<{
  coverImage: string | null;
  processedContentImages: Array<{ url: string; altText: string }>;
  processedAudioUrl: string | null;
  updatedContent: string | null;
}> {
  let coverImage: string | null = null;
  const processedContentImages: Array<{ url: string; altText: string }> = [];
  let processedAudioUrl: string | null = null;
  let updatedContent: string | null = existingContent || null;

  const imageUrlMap: Map<string, string> = new Map();

  if (featuredImageUrl) {
    const uploadedUrl = await downloadAndUploadFile(
      supabase,
      featuredImageUrl,
      "post-images",
      `covers/${slug}`
    );
    if (uploadedUrl) {
      coverImage = uploadedUrl;
      imageUrlMap.set(featuredImageUrl, uploadedUrl);
    } else {
      coverImage = featuredImageUrl;
    }
  }

  if (contentImages && contentImages.length > 0) {
    for (let i = 0; i < contentImages.length; i++) {
      const img = contentImages[i];
      const uploadedUrl = await downloadAndUploadFile(
        supabase,
        img.url,
        "post-images",
        `content/${slug}/${i}`
      );
      if (uploadedUrl) {
        processedContentImages.push({ url: uploadedUrl, altText: img.altText });
        imageUrlMap.set(img.url, uploadedUrl);
      } else {
        processedContentImages.push(img);
      }
    }
  }

  if (audioUrl) {
    const uploadedUrl = await downloadAndUploadFile(
      supabase,
      audioUrl,
      "post-audio",
      `${slug}`
    );
    processedAudioUrl = uploadedUrl || audioUrl;
  }

  if (updatedContent && imageUrlMap.size > 0) {
    for (const [originalUrl, newUrl] of imageUrlMap) {
      updatedContent = updatedContent.split(originalUrl).join(newUrl);
    }
  }

  return {
    coverImage,
    processedContentImages,
    processedAudioUrl,
    updatedContent,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const webhookUrlId = pathParts[pathParts.length - 1];

    if (!webhookUrlId || webhookUrlId === "gecko-webhook") {
      return new Response(JSON.stringify({ error: "Invalid webhook URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: siteSettings, error: settingsError } = await supabase
      .from("site_settings")
      .select("webhook_secret, site_url")
      .eq("webhook_id", webhookUrlId)
      .maybeSingle();

    if (settingsError || !siteSettings) {
      return new Response(JSON.stringify({ error: "Webhook not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.text();

    const signature = req.headers.get("X-Signature");
    const timestamp = req.headers.get("X-Timestamp");
    const geckoSecret = req.headers.get("X-GeckoGen-Secret");
    const authHeader = req.headers.get("Authorization");

    let isAuthenticated = false;

    if (signature && timestamp) {
      const timestampMs = parseInt(timestamp, 10);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (!isNaN(timestampMs) && Math.abs(now - timestampMs) <= fiveMinutes) {
        isAuthenticated = await verifySignature(
          payload,
          signature,
          timestamp,
          siteSettings.webhook_secret
        );
      }
    }

    if (!isAuthenticated && geckoSecret) {
      isAuthenticated = geckoSecret === siteSettings.webhook_secret;
    }

    if (!isAuthenticated && authHeader) {
      isAuthenticated = verifyBearerToken(authHeader, siteSettings.webhook_secret);
    }

    if (!isAuthenticated) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data: GeckoPayload = JSON.parse(payload);

    let categoryId: string | null = null;
    const categorySlug = data.category_slug || data.category?.slug;

    if (categorySlug) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .maybeSingle();

      if (category) {
        categoryId = category.id;
      }
    }

    const {
      coverImage,
      processedContentImages,
      processedAudioUrl,
      updatedContent,
    } = await processMediaFiles(
      supabase,
      data.slug,
      data.featured_image_url,
      data.content_images,
      data.audio_url,
      data.content_html
    );

    const isPublished = data.status === "publish";
    const finalContent = updatedContent || data.content_html;
    const readingTime = data.reading_time_minutes || calculateReadingTime(finalContent);
    const excerpt = data.meta_description || extractExcerpt(finalContent);

    const postData = {
      title: data.title,
      slug: data.slug,
      content: finalContent,
      content_markdown: data.content_markdown || null,
      excerpt: excerpt,
      meta_description: data.meta_description || "",
      cover_image: coverImage || data.featured_image_url || null,
      content_images: processedContentImages.length > 0 ? processedContentImages : (data.content_images || []),
      audio_url: processedAudioUrl || data.audio_url || null,
      youtube_video_id: data.youtube_video_id || null,
      json_ld_schemas: data.json_ld_schemas || [],
      category_id: categoryId,
      tags: data.tags || [],
      published: isPublished,
      published_at: data.published_at ? new Date(data.published_at).toISOString() : null,
      source: data.source || "GeckoAuthority",
      reading_time: readingTime,
      updated_at: new Date().toISOString(),
    };

    const { data: existingPost } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", data.slug)
      .maybeSingle();

    let post;
    let postError;

    if (existingPost) {
      const { data: updatedPost, error } = await supabase
        .from("posts")
        .update(postData)
        .eq("id", existingPost.id)
        .select("id, slug")
        .single();
      post = updatedPost;
      postError = error;
    } else {
      const { data: newPost, error } = await supabase
        .from("posts")
        .insert(postData)
        .select("id, slug")
        .single();
      post = newPost;
      postError = error;
    }

    if (postError || !post) {
      console.error("Database error:", postError);
      return new Response(
        JSON.stringify({ error: "Failed to save post", details: postError?.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const siteUrl = siteSettings.site_url || "";
    const postUrl = siteUrl ? `${siteUrl}/blog/${post.slug}` : `/blog/${post.slug}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: postUrl,
        post_id: post.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
