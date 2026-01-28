"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Github, Twitter, Linkedin, Globe, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useThemeConfig } from "@/lib/theme/context";

type MenuItem = {
  id: string;
  label: string;
  url: string;
  page_id: string | null;
  parent_id: string | null;
  location: string;
  position: number;
  open_in_new_tab: boolean;
};

type SocialLinks = {
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
};

type SiteSettings = {
  social_links: SocialLinks;
  contact_email: string;
  blog_name: string;
};

const defaultNavigation = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "/categories" },
];

export function Footer() {
  const { config } = useThemeConfig();
  const currentYear = new Date().getFullYear();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const logoUrl = config.siteSettings?.logoUrl || "/geckopress-logo.svg";

  useEffect(() => {
    async function fetchData() {
      try {
        const [menuResult, settingsResult] = await Promise.all([
          supabase
            .from("menu_items")
            .select("*")
            .or("location.eq.footer,location.eq.both")
            .is("parent_id", null)
            .order("position", { ascending: true }),
          supabase
            .from("site_settings")
            .select("social_links, contact_email, blog_name")
            .maybeSingle(),
        ]);

        if (!menuResult.error && menuResult.data) {
          setMenuItems(menuResult.data);
        }

        if (!settingsResult.error && settingsResult.data) {
          setSiteSettings(settingsResult.data);
        }
      } catch (error) {
        console.error("Failed to fetch footer data:", error);
      }
    }

    fetchData();
  }, []);

  const socialLinks = siteSettings?.social_links || {};
  const hasSocialLinks = Object.values(socialLinks).some(Boolean);
  const hasCustomMenu = menuItems.length > 0;

  const socialIcons = [
    { key: "twitter", icon: Twitter, label: "Twitter" },
    { key: "github", icon: Github, label: "GitHub" },
    { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
    { key: "website", icon: Globe, label: "Website" },
  ];

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src={logoUrl} alt="Logo" className="h-8" />
            </Link>

            <div className="flex items-center gap-4 flex-wrap justify-center">
              {hasCustomMenu ? (
                menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url || "#"}
                    target={item.open_in_new_tab ? "_blank" : undefined}
                    rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                    {item.open_in_new_tab && <ExternalLink className="h-3 w-3" />}
                  </Link>
                ))
              ) : (
                defaultNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                ))
              )}
              <Link href="/contact" className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</span>
              </Link>
            </div>

            {hasSocialLinks && (
              <div className="flex items-center gap-2">
                {socialIcons.map(({ key, icon: Icon, label }) => {
                  const url = socialLinks[key as keyof SocialLinks];
                  if (!url) return null;

                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
                      aria-label={label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t py-4">
          <p className="text-xs text-center text-muted-foreground">
            {currentYear} {siteSettings?.blog_name || "GeckoPress"}. All rights reserved. Powered by{" "}
            <a
              href="https://geckopress.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GeckoPress
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
