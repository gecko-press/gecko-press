import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { getSiteSettings } from "@/lib/supabase/queries";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 60;
export const dynamicParams = true;

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPage(slug: string) {
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([
    getPage(slug),
    getSiteSettings(),
  ]);

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  const baseUrl = settings?.site_url || process.env.NEXT_PUBLIC_SITE_URL || "https://geckopress.com";
  const pageUrl = `${baseUrl}/page/${page.slug}`;

  return {
    title: page.title,
    description: page.meta_description || undefined,
    openGraph: {
      type: "website",
      title: page.title,
      description: page.meta_description || undefined,
      url: pageUrl,
    },
    twitter: {
      card: "summary",
      title: page.title,
      description: page.meta_description || undefined,
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function PageView({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 pt-32 pb-16">
        <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 mt-5">
                {page.title}
              </h1>
            </div>
          </header>

          <div
            className="prose prose-zinc dark:prose-invert max-w-none
              prose-headings:font-semibold
              prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-8
              prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6
              prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-5
              prose-p:mb-4 prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-ul:my-4 prose-ol:my-4
              prose-li:my-1
              prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg
              prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-img:rounded-lg prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from("pages")
    .select("slug")
    .eq("is_published", true);

  return (data || []).map((page) => ({
    slug: page.slug,
  }));
}
