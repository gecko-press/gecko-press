import { DynamicHero } from "@/components/theme/dynamic-hero";
import { CategorySection } from "@/components/blog/category-section";
import { Newsletter } from "@/components/blog/newsletter";
import { AdSensePlaceholder } from "@/components/blog/adsense-placeholder";
import { getHomepageCategories, getPostsByCategory, getSiteSettings } from "@/lib/supabase/queries";
import type { Post } from "@/lib/supabase/types";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getHomepageCategories(),
  ]);

  const categoriesWithPosts = await Promise.all(
    categories.map(async (category) => {
      const posts = await getPostsByCategory(category.slug);
      return { category, posts };
    })
  );

  return (
    <>
      <DynamicHero />

      {settings?.adsense_home_after_hero && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div dangerouslySetInnerHTML={{ __html: settings.adsense_home_after_hero }} />
        </div>
      )}
      {!settings?.adsense_home_after_hero && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <AdSensePlaceholder format="horizontal" />
        </div>
      )}

      <div className="space-y-6">
        {categoriesWithPosts.map(({ category, posts }, index) => {
          const blogPosts: Post[] = posts;
          return (
            <div key={category.id}>
              <CategorySection category={category} posts={blogPosts} />

              {index === Math.floor(categoriesWithPosts.length / 2) - 1 && (
                <>
                  {settings?.adsense_home_between_categories ? (
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                      <div dangerouslySetInnerHTML={{ __html: settings.adsense_home_between_categories }} />
                    </div>
                  ) : (
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                      <AdSensePlaceholder format="horizontal" />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {settings?.adsense_home_before_newsletter ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div dangerouslySetInnerHTML={{ __html: settings.adsense_home_before_newsletter }} />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <AdSensePlaceholder format="horizontal" />
        </div>
      )}

      <Newsletter />
    </>
  );
}
