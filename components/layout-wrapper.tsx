"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { ThemeConfigProvider } from "@/lib/theme/context";
import { I18nProvider } from "@/lib/i18n/provider";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isLogin = pathname?.startsWith("/login");

  if (isAdmin || isLogin) {
    return <ThemeConfigProvider>{children}</ThemeConfigProvider>;
  }

  return (
    <ThemeConfigProvider>
      <I18nProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </I18nProvider>
    </ThemeConfigProvider>
  );
}
