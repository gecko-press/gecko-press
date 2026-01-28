import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { AuthProvider } from "@/lib/auth/context";
import { DialogProvider } from "@/lib/dialogs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://geckopress.com"),
  title: {
    default: "GeckoPress - Modern Blog Platform",
    template: "%s | GeckoPress",
  },
  description:
    "A modern, customizable blog and content management platform built with Next.js and Supabase.",
  keywords: [
    "blog",
    "seo",
    "samples",
    "nextjs",
    "react",
    "open source",
  ],
  authors: [{ name: "GeckoPress" }],
  creator: "GeckoPress",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "GeckoPress",
    title: "GeckoPress - Modern Blog Platform",
    description:
      "A modern, customizable blog and content management platform built with Next.js and Supabase.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GeckoPress - Modern Blog Platform",
    description:
      "A modern, customizable blog and content management platform built with Next.js and Supabase.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const themeInitScript = `
(function() {
  try {
    var cached = localStorage.getItem('geckopress-theme-cache');
    if (!cached) return;

    var config = JSON.parse(cached);
    var root = document.documentElement;

    var palettes = {
      forest: '152', ocean: '210', sunset: '25', rose: '350', slate: '220',
      emerald: '160', amber: '45', coral: '16', teal: '175', crimson: '0',
      sky: '199', lime: '84', gold: '43', navy: '224', charcoal: '0'
    };

    var fontSets = {
      modern: { heading: 'Inter, system-ui, sans-serif', body: 'Inter, system-ui, sans-serif', mono: 'ui-monospace, SFMono-Regular, monospace' },
      elegant: { heading: 'Playfair Display, Georgia, serif', body: 'Source Sans 3, system-ui, sans-serif', mono: 'ui-monospace, SFMono-Regular, monospace' },
      tech: { heading: 'JetBrains Mono, monospace', body: 'system-ui, -apple-system, sans-serif', mono: 'JetBrains Mono, monospace' }
    };

    var radiusValues = { none: '0', sm: '0.25rem', md: '0.5rem', lg: '0.75rem', full: '9999px' };

    var hue = palettes[config.colorPalette] || '160';
    var fontSet = fontSets[config.fontSet] || fontSets.modern;
    var radius = radiusValues[config.radius] || radiusValues.md;
    var isDark = root.classList.contains('dark');

    root.style.setProperty('--font-heading', fontSet.heading);
    root.style.setProperty('--font-body', fontSet.body);
    root.style.setProperty('--font-mono', fontSet.mono);
    root.style.setProperty('--radius', radius);

    if (isDark) {
      root.style.setProperty('--border', hue + ' 15% 16%');
      root.style.setProperty('--input', hue + ' 15% 16%');
      root.style.setProperty('--muted', hue + ' 15% 14%');
      root.style.setProperty('--muted-foreground', hue + ' 10% 55%');
      root.style.setProperty('--card', hue + ' 15% 8%');
      root.style.setProperty('--card-foreground', hue + ' 10% 95%');
      root.style.setProperty('--popover', hue + ' 15% 8%');
      root.style.setProperty('--popover-foreground', hue + ' 10% 95%');
      root.style.setProperty('--secondary', hue + ' 15% 14%');
      root.style.setProperty('--secondary-foreground', hue + ' 10% 95%');
    } else {
      root.style.setProperty('--border', hue + ' 10% 90%');
      root.style.setProperty('--input', hue + ' 10% 90%');
      root.style.setProperty('--muted', hue + ' 10% 96%');
      root.style.setProperty('--muted-foreground', hue + ' 10% 40%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--card-foreground', hue + ' 10% 10%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--popover-foreground', hue + ' 10% 10%');
      root.style.setProperty('--secondary', hue + ' 10% 96%');
      root.style.setProperty('--secondary-foreground', hue + ' 10% 10%');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="RSS Feed"
          href="/feed.xml"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <DialogProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
              <Toaster position="top-right" richColors closeButton />
            </DialogProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
