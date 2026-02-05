"use client";

import { useRef, useState } from "react";
import { Globe, ImageIcon, Upload, X, Loader2, Type, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDialogs } from "@/lib/dialogs";
import { useTranslations } from "next-intl";
import { languages } from "@/lib/i18n/config";

type GeneralSettings = {
  blog_name: string;
  site_url: string;
  logo_url: string;
  default_locale: string;
};

type GeneralTabProps = {
  settings: GeneralSettings;
  onChange: (settings: GeneralSettings) => void;
};

export function GeneralTab({ settings, onChange }: GeneralTabProps) {
  const t = useTranslations("admin.settings.general");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showError } = useDialogs();

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError(t("image_error"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showError(t("size_error"));
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onChange({ ...settings, logo_url: base64 });
        setUploading(false);
      };
      reader.onerror = () => {
        showError(t("read_error"));
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      showError(t("upload_error"));
      setUploading(false);
    }
  }

  function handleRemoveLogo() {
    onChange({ ...settings, logo_url: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const logoSrc = settings.logo_url || "/geckopress-logo.svg";

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{t("logo_title")}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t("logo_description")}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-48 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
              <img
                src={logoSrc}
                alt={t("logo_title")}
                className="max-w-full max-h-full object-contain p-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    {t("uploading")}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1.5" />
                    {t("upload_logo")}
                  </>
                )}
              </Button>
              {settings.logo_url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  {t("remove")}
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("supported_formats")}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{t("blog_name_title")}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t("blog_name_description")}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-name" className="text-xs text-zinc-600 dark:text-zinc-400">
            {t("blog_name_label")}
          </Label>
          <Input
            id="blog-name"
            value={settings.blog_name}
            onChange={(e) => onChange({ ...settings, blog_name: e.target.value })}
            placeholder={t("blog_name_placeholder")}
            className="bg-zinc-50 dark:bg-zinc-800/50"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{t("site_url_title")}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t("site_url_description")}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="site-url" className="text-xs text-zinc-600 dark:text-zinc-400">
            {t("site_url_label")}
          </Label>
          <Input
            id="site-url"
            value={settings.site_url}
            onChange={(e) => onChange({ ...settings, site_url: e.target.value })}
            placeholder={t("site_url_placeholder")}
            className="bg-zinc-50 dark:bg-zinc-800/50"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Languages className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{t("language_title")}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {t("language_description")}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="default-locale" className="text-xs text-zinc-600 dark:text-zinc-400">
            {t("language_label")}
          </Label>
          <Select
            value={settings.default_locale}
            onValueChange={(value) => onChange({ ...settings, default_locale: value })}
          >
            <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800/50">
              <SelectValue placeholder={t("language_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
