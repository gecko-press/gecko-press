"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { ThemeConfigProvider } from "@/lib/theme/context";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isLogin = pathname?.startsWith("/login");

  if (isAdmin || isLogin) {
    return <ThemeConfigProvider>{children}</ThemeConfigProvider>;
  }

  return (
    <ThemeConfigProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ThemeConfigProvider>
  );
}
