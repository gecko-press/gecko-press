import { DynamicHero } from "@/components/theme/dynamic-hero";
import { CategorySection } from "@/components/blog/category-section";
import { Newsletter } from "@/components/blog/newsletter";
import { getHomepageCategoriesWithPosts, getSiteSettings } from "@/lib/supabase/queries";
import { sanitizeAdCode } from "@/lib/utils/sanitize";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, categoriesWithPosts] = await Promise.all([
    getSiteSettings(),
    getHomepageCategoriesWithPosts(),
  ]);

  return (
    <>
      <DynamicHero />

      {settings?.adsense_home_after_hero && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div dangerouslySetInnerHTML={{ __html: sanitizeAdCode(settings.adsense_home_after_hero) }} />
        </div>
      )}

      <div className="space-y-6">
        {categoriesWithPosts.map(({ category, posts }, index) => (
          <div key={category.id}>
            <CategorySection category={category} posts={posts} />

              {index === Math.floor(categoriesWithPosts.length / 2) - 1 && settings?.adsense_home_between_categories && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                  <div dangerouslySetInnerHTML={{ __html: sanitizeAdCode(settings.adsense_home_between_categories) }} />
                </div>
              )}
          </div>
        ))}
      </div>

      {settings?.adsense_home_before_newsletter && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div dangerouslySetInnerHTML={{ __html: sanitizeAdCode(settings.adsense_home_before_newsletter) }} />
        </div>
      )}

      <Newsletter />
    </>
  );
}
