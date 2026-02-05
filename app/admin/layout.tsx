import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import { I18nProvider } from "@/lib/i18n/provider";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </I18nProvider>
  );
}
