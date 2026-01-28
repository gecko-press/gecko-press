"use client";

import { Code, LayoutTemplate, PanelLeft, ArrowUp, ArrowDown, PanelBottom, Grid3x3, ShieldAlert, Home, Layers, Mail } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AdSenseSettings = {
  adsense_header: string;
  adsense_before_content: string;
  adsense_article: string;
  adsense_after_content: string;
  adsense_sidebar: string;
  adsense_category_sidebar: string;
  adsense_footer: string;
  adsense_home_after_hero: string;
  adsense_home_between_categories: string;
  adsense_home_before_newsletter: string;
};

type AdSenseTabProps = {
  settings: AdSenseSettings;
  onChange: (settings: AdSenseSettings) => void;
};

export function AdSenseTab({ settings, onChange }: AdSenseTabProps) {
  return (
    <div className="space-y-6">
      <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
        <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertTitle className="text-orange-800 dark:text-orange-200">Ad Blocker Detected?</AlertTitle>
        <AlertDescription className="text-orange-700 dark:text-orange-300 text-xs">
          If you cannot see the input fields below, please disable your ad blocker for this page.
          Ad blockers may hide elements containing ad-related keywords.
        </AlertDescription>
      </Alert>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Code className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Header Ad Code</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Google AdSense script tag placed in the head section of your site
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="adsense-header" className="text-xs text-zinc-600 dark:text-zinc-400">
            AdSense Script Tag
          </Label>
          <Textarea
            id="adsense-header"
            value={settings.adsense_header}
            onChange={(e) => onChange({ ...settings, adsense_header: e.target.value })}
            placeholder='<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX" crossorigin="anonymous"></script>'
            className="font-mono text-xs min-h-[80px] bg-zinc-50 dark:bg-zinc-800/50"
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Blog Post Ad Placements</h3>
        <div className="grid gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <ArrowUp className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Before Content Ad</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Displayed above the article content (horizontal banner)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adsense-before-content" className="text-xs text-zinc-600 dark:text-zinc-400">
                Ad Unit Code
              </Label>
              <Textarea
                id="adsense-before-content"
                value={settings.adsense_before_content}
                onChange={(e) => onChange({ ...settings, adsense_before_content: e.target.value })}
                placeholder="Paste your horizontal ad unit code here..."
                className="font-mono text-xs min-h-[100px] bg-zinc-50 dark:bg-zinc-800/50"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <LayoutTemplate className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">In-Article Ad</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Displayed within blog post content (rectangle format)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adsense-article" className="text-xs text-zinc-600 dark:text-zinc-400">
                Ad Unit Code
              </Label>
              <Textarea
                id="adsense-article"
                value={settings.adsense_article}
                onChange={(e) => onChange({ ...settings, adsense_article: e.target.value })}
                placeholder="Paste your in-article ad unit code here..."
                className="font-mono text-xs min-h-[100px] bg-zinc-50 dark:bg-zinc-800/50"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <ArrowDown className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">After Content Ad</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Displayed below the article content (rectangle format)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adsense-after-content" className="text-xs text-zinc-600 dark:text-zinc-400">
                Ad Unit Code
              </Label>
              <Textarea
                id="adsense-after-content"
                value={settings.adsense_after_content}
                onChange={(e) => onChange({ ...settings, adsense_after_content: e.target.value })}
                placeholder="Paste your after-content ad unit code here..."
                className="font-mono text-xs min-h-[100px] bg-zinc-50 dark:bg-zinc-800/50"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
                <PanelLeft className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Blog Sidebar Ad</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Displayed in blog post sidebar (vertical format, sticky)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adsense-sidebar" className="text-xs text-zinc-600 dark:text-zinc-400">
                Ad Unit Code
              </Label>
              <Textarea
                id="adsense-sidebar"
                value={settings.adsense_sidebar}
                onChange={(e) => onChange({ ...settings, adsense_sidebar: e.target.value })}
                placeholder="Paste your sidebar ad unit code here..."
                className="font-mono text-xs min-h-[100px] bg-zinc-50 dark:bg-zinc-800/50"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Home Page Ad Placements</h3>
        <div className="grid gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                <Home className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">After Hero Ad</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Displayed below the hero section on home page (horizontal banner)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adsense-home-after-hero" className="text-xs text-zinc-600 dark:text-zinc-400">
                Ad Unit Code
              </Label>
              <Textarea
                id="adsense-home-after-hero"
                value={settings.adsense_home_after_hero}
                onChange={(e) => onChange({ ...settings, adsense_home_after_hero: e.target.value })}
                placeholder="Paste your after hero ad unit code here..."
                className="font-mono text-xs min-h-[100px] bg-zinc-50 dark:bg-zinc-800/50"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Between Categories Ad</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Displayed between category sections on home page (horizontal banner)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adsense-home-between-categories" className="text-xs text-zinc-600 dark:text-zinc-400">
                Ad Unit Code
              </Label>
              <Textarea
                id="adsense-home-between-categories"
                value={settings.adsense_home_between_categories}
                onChange={(e) => onChange({ ...settings, adsense_home_between_categories: e.target.value })}
                placeholder="Paste your between categories ad unit code here..."
                className="font-mono text-xs min-h-[100px] bg-zinc-50 dark:bg-zinc-800/50"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Before Newsletter Ad</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Displayed above the newsletter section on home page (horizontal banner)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adsense-home-before-newsletter" className="text-xs text-zinc-600 dark:text-zinc-400">
                Ad Unit Code
              </Label>
              <Textarea
                id="adsense-home-before-newsletter"
                value={settings.adsense_home_before_newsletter}
                onChange={(e) => onChange({ ...settings, adsense_home_before_newsletter: e.target.value })}
                placeholder="Paste your before newsletter ad unit code here..."
                className="font-mono text-xs min-h-[100px] bg-zinc-50 dark:bg-zinc-800/50"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Category Page Ad Placements</h3>
        <div className="grid gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                <Grid3x3 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Category Sidebar Ad</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Displayed in category page sidebar (vertical format)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adsense-category-sidebar" className="text-xs text-zinc-600 dark:text-zinc-400">
                Ad Unit Code
              </Label>
              <Textarea
                id="adsense-category-sidebar"
                value={settings.adsense_category_sidebar}
                onChange={(e) => onChange({ ...settings, adsense_category_sidebar: e.target.value })}
                placeholder="Paste your category sidebar ad unit code here..."
                className="font-mono text-xs min-h-[100px] bg-zinc-50 dark:bg-zinc-800/50"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">Site-Wide Ad Placements</h3>
        <div className="grid gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                <PanelBottom className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Footer Ad</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Displayed at the bottom of pages (horizontal banner)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adsense-footer" className="text-xs text-zinc-600 dark:text-zinc-400">
                Ad Unit Code
              </Label>
              <Textarea
                id="adsense-footer"
                value={settings.adsense_footer}
                onChange={(e) => onChange({ ...settings, adsense_footer: e.target.value })}
                placeholder="Paste your footer ad unit code here..."
                className="font-mono text-xs min-h-[100px] bg-zinc-50 dark:bg-zinc-800/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-xs text-amber-800 dark:text-amber-200">
          <strong>Note:</strong> Make sure your AdSense account is approved and your site complies with Google AdSense policies before adding ad codes. Each ad placement uses a different ad unit from your AdSense dashboard.
        </p>
      </div>
    </div>
  );
}
