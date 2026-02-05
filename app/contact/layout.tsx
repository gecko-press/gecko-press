import { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n/provider";

export const metadata: Metadata = {
  title: "Contact Us - GeckoraPress",
  description: "Get in touch with the GeckoraPress team. Send us your questions, feedback, or business inquiries.",
  openGraph: {
    type: "website",
    title: "Contact Us - GeckoraPress",
    description: "Get in touch with the GeckoraPress team. Send us your questions, feedback, or business inquiries.",
  },
  twitter: {
    card: "summary",
    title: "Contact Us - GeckoraPress",
    description: "Get in touch with the GeckoraPress team. Send us your questions, feedback, or business inquiries.",
  },
};

export const dynamic = "force-dynamic";

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <I18nProvider>{children}</I18nProvider>;
}
