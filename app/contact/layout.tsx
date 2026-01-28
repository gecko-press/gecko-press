import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - GeckoPress",
  description: "Get in touch with the GeckoPress team. Send us your questions, feedback, or business inquiries.",
  openGraph: {
    type: "website",
    title: "Contact Us - GeckoPress",
    description: "Get in touch with the GeckoPress team. Send us your questions, feedback, or business inquiries.",
  },
  twitter: {
    card: "summary",
    title: "Contact Us - GeckoPress",
    description: "Get in touch with the GeckoPress team. Send us your questions, feedback, or business inquiries.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
