"use client";

import { useRef, useState } from "react";
import { Globe, ImageIcon, Upload, X, Loader2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDialogs } from "@/lib/dialogs";

type GeneralSettings = {
  blog_name: string;
  site_url: string;
  logo_url: string;
};

type GeneralTabProps = {
  settings: GeneralSettings;
  onChange: (settings: GeneralSettings) => void;
};

export function GeneralTab({ settings, onChange }: GeneralTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showError } = useDialogs();

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showError("File size must be less than 2MB");
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
        showError("Failed to read file");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      showError("Failed to upload logo");
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
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Site Logo</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Upload your custom logo (max 2MB, recommended size: 200x50px)
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-48 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
              <img
                src={logoSrc}
                alt="Site Logo"
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
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1.5" />
                    Upload Logo
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
                  Remove
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Supported formats: PNG, JPG, SVG, WebP
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Blog Name</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Your blog&apos;s name (displayed in footer and other areas)
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-name" className="text-xs text-zinc-600 dark:text-zinc-400">
            Name
          </Label>
          <Input
            id="blog-name"
            value={settings.blog_name}
            onChange={(e) => onChange({ ...settings, blog_name: e.target.value })}
            placeholder="My Awesome Blog"
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
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Site URL</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Your blog&apos;s public URL (used in RSS feed, sitemap, etc.)
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="site-url" className="text-xs text-zinc-600 dark:text-zinc-400">
            URL
          </Label>
          <Input
            id="site-url"
            value={settings.site_url}
            onChange={(e) => onChange({ ...settings, site_url: e.target.value })}
            placeholder="https://yourdomain.com"
            className="bg-zinc-50 dark:bg-zinc-800/50"
          />
        </div>
      </div>
    </div>
  );
}
