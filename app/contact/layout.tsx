import { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n/provider";
import { getSiteSettings } from "@/lib/supabase/queries";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings?.blog_name || "Blog";
  const title = `Contact Us - ${siteName}`;
  const description = `Get in touch with the ${siteName} team. Send us your questions, feedback, or business inquiries.`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const initialLocale = (settings?.default_locale as Locale) || "en";

  return <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>;
}
