import { I18nProvider } from "@/lib/i18n/provider";
import { getSiteSettings } from "@/lib/supabase/queries";
import type { Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const initialLocale = (settings?.default_locale as Locale) || "en";

  return (
    <I18nProvider initialLocale={initialLocale}>
      {children}
    </I18nProvider>
  );
}
