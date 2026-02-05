import { I18nProvider } from "@/lib/i18n/provider";

export const dynamic = "force-dynamic";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  );
}
