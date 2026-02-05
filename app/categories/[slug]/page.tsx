import { Metadata } from "next";
import { getCategories, getCategoryBySlug, getPostsByCategory, getSiteSettings } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import { CategoryPageClient } from "./category-page-client";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };

  const settings = await getSiteSettings();
  const baseUrl = settings?.site_url || process.env.NEXT_PUBLIC_SITE_URL || "https://geckopress.org";
  const categoryUrl = `${baseUrl}/categories/${slug}`;
  const description = category.description || `Explore articles about ${category.name}`;

  return {
    title: `${category.name} - GeckoPress`,
    description,
    openGraph: {
      type: "website",
      title: `${category.name} - GeckoPress`,
      description,
      url: categoryUrl,
    },
    twitter: {
      card: "summary",
      title: `${category.name} - GeckoPress`,
      description,
    },
    alternates: {
      canonical: categoryUrl,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const posts = await getPostsByCategory(slug);
  const otherCategories = allCategories.filter((cat) => cat.id !== category.id);

  return (
    <CategoryPageClient
      category={category}
      posts={posts}
      otherCategories={otherCategories}
    />
  );
}
