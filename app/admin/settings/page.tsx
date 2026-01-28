"use client";

import { useEffect, useState, useMemo } from "react";
import { Save, RotateCcw, Palette, Code, Webhook, Mail, User, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import { useDialogs } from "@/lib/dialogs";
import {
  ThemeTab,
  AdSenseTab,
  GeckoAuthorityTab,
  ContactTab,
  ProfileTab,
  GeneralTab,
} from "@/components/admin/settings";
import type { HeroSettings } from "@/lib/supabase/types";

type SocialLinks = {
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
};

const defaultHeroSettings: HeroSettings = {
  centered: {
    badge: "Powered by GeckoAuthority",
    title: "Modern Blog",
    subtitle: "Ultra Fast & SEO Focused",
    description: "Showcase your content created with GeckoAuthority. Meet the world's fastest autonomous blog platform.",
    searchPlaceholder: "Search articles...",
    features: [
      { icon: "Zap", title: "Lightning Fast", description: "Maximum performance with Next.js 13" },
      { icon: "Globe", title: "SEO Optimized", description: "Rank higher in search engines" },
      { icon: "Shield", title: "Open Source", description: "Completely free under MIT license" },
    ],
  },
  split: {
    badge: "Top Technology Blog",
    title: "Discover the",
    subtitle: "Future of Tech",
    description: "In-depth reviews, guides, and insights on the latest technology trends. Stay ahead with expert analysis and recommendations.",
    searchPlaceholder: "What are you looking for?",
    imageUrl: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200",
    metrics: [
      { icon: "BookOpen", value: "500+", label: "Articles" },
      { icon: "Users", value: "50K+", label: "Readers" },
      { icon: "TrendingUp", value: "10+", label: "Categories" },
    ],
  },
  minimal: {
    title: "Tech insights,",
    subtitle: "simplified.",
    description: "Expert reviews and buying guides to help you make smarter tech decisions.",
    searchPlaceholder: "Search articles...",
  },
};

type Settings = {
  hero_variant: string;
  card_variant: string;
  font_set: string;
  color_palette: string;
  radius: string;
  hero_settings: HeroSettings;
  newsletter_title: string;
  newsletter_description: string;
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
  webhook_id: string;
  webhook_secret: string;
  contact_email: string;
  contact_address: string;
  social_links: SocialLinks;
  author_name: string;
  author_bio: string;
  blog_name: string;
  site_url: string;
  logo_url: string;
};

const defaultSettings: Settings = {
  hero_variant: "centered",
  card_variant: "classic",
  font_set: "modern",
  color_palette: "forest",
  radius: "md",
  hero_settings: defaultHeroSettings,
  newsletter_title: "Stay Updated",
  newsletter_description: "Join our newsletter for the latest updates delivered straight to your inbox.",
  adsense_header: "",
  adsense_before_content: "",
  adsense_article: "",
  adsense_after_content: "",
  adsense_sidebar: "",
  adsense_category_sidebar: "",
  adsense_footer: "",
  adsense_home_after_hero: "",
  adsense_home_between_categories: "",
  adsense_home_before_newsletter: "",
  webhook_id: "",
  webhook_secret: "",
  contact_email: "",
  contact_address: "",
  social_links: {},
  author_name: "",
  author_bio: "",
  blog_name: "",
  site_url: "",
  logo_url: "",
};

export default function SettingsPage() {
  const { showError, showSuccess } = useDialogs();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<Settings>(defaultSettings);
  const [activeTab, setActiveTab] = useState("general");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  useEffect(() => {
    async function fetchSettings() {
      try {
        const [themeResult, siteResult] = await Promise.all([
          supabase.from("theme_settings").select("*").eq("key", "global").maybeSingle(),
          supabase.from("site_settings").select("*").maybeSingle(),
        ]);

        const loadedSettings: Settings = { ...defaultSettings };

        if (themeResult.data) {
          loadedSettings.hero_variant = themeResult.data.hero_variant;
          loadedSettings.card_variant = themeResult.data.card_variant;
          loadedSettings.font_set = themeResult.data.font_set;
          loadedSettings.color_palette = themeResult.data.color_palette;
          loadedSettings.radius = themeResult.data.radius;
          loadedSettings.hero_settings = themeResult.data.hero_settings || defaultHeroSettings;
          loadedSettings.newsletter_title = themeResult.data.newsletter_title || defaultSettings.newsletter_title;
          loadedSettings.newsletter_description = themeResult.data.newsletter_description || defaultSettings.newsletter_description;
        }

        if (siteResult.data) {
          loadedSettings.adsense_header = siteResult.data.adsense_header || "";
          loadedSettings.adsense_before_content = siteResult.data.adsense_before_content || "";
          loadedSettings.adsense_article = siteResult.data.adsense_article || "";
          loadedSettings.adsense_after_content = siteResult.data.adsense_after_content || "";
          loadedSettings.adsense_sidebar = siteResult.data.adsense_sidebar || "";
          loadedSettings.adsense_category_sidebar = siteResult.data.adsense_category_sidebar || "";
          loadedSettings.adsense_footer = siteResult.data.adsense_footer || "";
          loadedSettings.adsense_home_after_hero = siteResult.data.adsense_home_after_hero || "";
          loadedSettings.adsense_home_between_categories = siteResult.data.adsense_home_between_categories || "";
          loadedSettings.adsense_home_before_newsletter = siteResult.data.adsense_home_before_newsletter || "";
          loadedSettings.webhook_id = siteResult.data.webhook_id || "";
          loadedSettings.webhook_secret = siteResult.data.webhook_secret || "";
          loadedSettings.contact_email = siteResult.data.contact_email || "";
          loadedSettings.contact_address = siteResult.data.contact_address || "";
          loadedSettings.social_links = siteResult.data.social_links || {};
          loadedSettings.author_name = siteResult.data.author_name || "";
          loadedSettings.author_bio = siteResult.data.author_bio || "";
          loadedSettings.blog_name = siteResult.data.blog_name || "";
          loadedSettings.site_url = siteResult.data.site_url || "";
          loadedSettings.logo_url = siteResult.data.logo_url || "";
        }

        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  async function handleSave() {
    setSaving(true);

    try {
      const themeUpdate = supabase
        .from("theme_settings")
        .update({
          hero_variant: settings.hero_variant,
          card_variant: settings.card_variant,
          font_set: settings.font_set,
          color_palette: settings.color_palette,
          radius: settings.radius,
          hero_settings: settings.hero_settings,
          newsletter_title: settings.newsletter_title,
          newsletter_description: settings.newsletter_description,
          updated_at: new Date().toISOString(),
        })
        .eq("key", "global");

      const { data: existingSiteSettings } = await supabase
        .from("site_settings")
        .select("id")
        .maybeSingle();

      let siteUpdate;
      if (existingSiteSettings) {
        siteUpdate = supabase
          .from("site_settings")
          .update({
            adsense_header: settings.adsense_header,
            adsense_before_content: settings.adsense_before_content,
            adsense_article: settings.adsense_article,
            adsense_after_content: settings.adsense_after_content,
            adsense_sidebar: settings.adsense_sidebar,
            adsense_category_sidebar: settings.adsense_category_sidebar,
            adsense_footer: settings.adsense_footer,
            adsense_home_after_hero: settings.adsense_home_after_hero,
            adsense_home_between_categories: settings.adsense_home_between_categories,
            adsense_home_before_newsletter: settings.adsense_home_before_newsletter,
            webhook_id: settings.webhook_id,
            webhook_secret: settings.webhook_secret,
            contact_email: settings.contact_email,
            contact_address: settings.contact_address,
            social_links: settings.social_links,
            author_name: settings.author_name,
            author_bio: settings.author_bio,
            blog_name: settings.blog_name,
            site_url: settings.site_url,
            logo_url: settings.logo_url,
          })
          .eq("id", existingSiteSettings.id);
      } else {
        const { data: userData } = await supabase.auth.getUser();
        siteUpdate = supabase.from("site_settings").insert({
          user_id: userData.user?.id,
          adsense_header: settings.adsense_header,
          adsense_before_content: settings.adsense_before_content,
          adsense_article: settings.adsense_article,
          adsense_after_content: settings.adsense_after_content,
          adsense_sidebar: settings.adsense_sidebar,
          adsense_category_sidebar: settings.adsense_category_sidebar,
          adsense_footer: settings.adsense_footer,
          adsense_home_after_hero: settings.adsense_home_after_hero,
          adsense_home_between_categories: settings.adsense_home_between_categories,
          adsense_home_before_newsletter: settings.adsense_home_before_newsletter,
          webhook_id: settings.webhook_id,
          webhook_secret: settings.webhook_secret,
          contact_email: settings.contact_email,
          contact_address: settings.contact_address,
          social_links: settings.social_links,
          author_name: settings.author_name,
          author_bio: settings.author_bio,
          blog_name: settings.blog_name,
          site_url: settings.site_url,
          logo_url: settings.logo_url,
        });
      }

      const [themeError, siteError] = await Promise.all([
        themeUpdate.then((r) => r.error),
        siteUpdate.then((r) => r.error),
      ]);

      if (themeError) throw themeError;
      if (siteError) throw siteError;

      setOriginalSettings(settings);
      showSuccess("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setSettings(originalSettings);
  }

  async function handlePasswordChange(currentPassword: string, newPassword: string) {
    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData.user?.email;

    if (!userEmail) {
      throw new Error("User email not found");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (signInError) {
      throw new Error("Current password is incorrect");
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Settings</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your site configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset
          </Button>
          <Button size="sm" className="h-9" onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-zinc-100 dark:bg-zinc-800">
          <TabsTrigger value="general" className="gap-1.5 text-xs sm:text-sm">
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-1.5 text-xs sm:text-sm">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="adsense" className="gap-1.5 text-xs sm:text-sm">
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">AdSense</span>
          </TabsTrigger>
          <TabsTrigger value="gecko" className="gap-1.5 text-xs sm:text-sm">
            <Webhook className="w-4 h-4" />
            <span className="hidden sm:inline">Gecko Authority</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5 text-xs sm:text-sm">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <GeneralTab
            settings={{
              blog_name: settings.blog_name,
              site_url: settings.site_url,
              logo_url: settings.logo_url,
            }}
            onChange={(generalSettings) => setSettings({ ...settings, ...generalSettings })}
          />
        </TabsContent>

        <TabsContent value="theme" className="mt-4">
          <ThemeTab
            settings={{
              hero_variant: settings.hero_variant,
              card_variant: settings.card_variant,
              font_set: settings.font_set,
              color_palette: settings.color_palette,
              radius: settings.radius,
              hero_settings: settings.hero_settings,
              newsletter_title: settings.newsletter_title,
              newsletter_description: settings.newsletter_description,
            }}
            onChange={(themeSettings) => setSettings({ ...settings, ...themeSettings })}
          />
        </TabsContent>

        <TabsContent value="adsense" className="mt-4">
          <AdSenseTab
            settings={{
              adsense_header: settings.adsense_header,
              adsense_before_content: settings.adsense_before_content,
              adsense_article: settings.adsense_article,
              adsense_after_content: settings.adsense_after_content,
              adsense_sidebar: settings.adsense_sidebar,
              adsense_category_sidebar: settings.adsense_category_sidebar,
              adsense_footer: settings.adsense_footer,
              adsense_home_after_hero: settings.adsense_home_after_hero,
              adsense_home_between_categories: settings.adsense_home_between_categories,
              adsense_home_before_newsletter: settings.adsense_home_before_newsletter,
            }}
            onChange={(adsenseSettings) => setSettings({ ...settings, ...adsenseSettings })}
          />
        </TabsContent>

        <TabsContent value="gecko" className="mt-4">
          <GeckoAuthorityTab
            settings={{
              webhook_id: settings.webhook_id,
              webhook_secret: settings.webhook_secret,
            }}
            onChange={(geckoSettings) => setSettings({ ...settings, ...geckoSettings })}
            supabaseUrl={supabaseUrl}
          />
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <ContactTab
            settings={{
              contact_email: settings.contact_email,
              contact_address: settings.contact_address,
              social_links: settings.social_links,
            }}
            onChange={(contactSettings) => setSettings({ ...settings, ...contactSettings })}
          />
        </TabsContent>

        <TabsContent value="profile" className="mt-4">
          <ProfileTab
            settings={{
              author_name: settings.author_name,
              author_bio: settings.author_bio,
            }}
            onChange={(profileSettings) => setSettings({ ...settings, ...profileSettings })}
            onPasswordChange={handlePasswordChange}
          />
        </TabsContent>
      </Tabs>

      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-3 flex items-center gap-3 z-50">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Unsaved changes</p>
          <Button onClick={handleSave} disabled={saving} size="sm" className="h-8">
            {saving ? "Saving.." : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}
