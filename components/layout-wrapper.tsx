import { getSiteSettings } from "@/lib/supabase/queries";
import { LayoutWrapperClient } from "./layout-wrapper-client";
import type { Locale } from "@/lib/i18n/config";

export async function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const initialLocale = (settings?.default_locale as Locale) || "en";

  return (
    <LayoutWrapperClient initialLocale={initialLocale}>
      {children}
    </LayoutWrapperClient>
  );
}
