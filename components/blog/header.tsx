"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useThemeConfig } from "@/lib/theme/context";

const IconHome = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconGrid = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
  </svg>
);

const IconMoon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);

const IconSun = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);

const IconMenu = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const IconX = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const IconChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const IconExternalLink = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
  </svg>
);

const IconRss = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>
  </svg>
);

type MenuItem = {
  id: string;
  label: string;
  url: string;
  page_id: string | null;
  parent_id: string | null;
  location: string;
  position: number;
  open_in_new_tab: boolean;
  children?: MenuItem[];
};

export function Header() {
  const t = useTranslations('header');
  const { resolvedTheme, setTheme } = useTheme();
  const { config } = useThemeConfig();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logoUrl = config.siteSettings?.logoUrl || "/geckopress-logo.svg";

  const defaultNavigation = [
    { name: t('home'), href: "/", icon: IconHome },
    { name: t('categories'), href: "/categories", icon: IconGrid },
  ];

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .or("location.eq.header,location.eq.both")
          .order("position", { ascending: true });

        if (!error && data) {
          setMenuItems(data);
        }
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    }

    fetchMenuItems();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function buildMenuTree(items: MenuItem[], parentId: string | null = null): MenuItem[] {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildMenuTree(items, item.id),
      }))
      .sort((a, b) => a.position - b.position);
  }

  const menuTree = buildMenuTree(menuItems);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="gap-2 group relative h-12 w-36">
            <Image src={logoUrl} alt="Logo" fill className="object-contain object-left" priority />
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 mr-2" ref={dropdownRef}>
              {defaultNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}

              {menuTree.map((item) => {
                const isDropdown = !item.page_id && !item.url && item.children && item.children.length > 0;

                if (isDropdown) {
                  return (
                    <div key={item.id} className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                      >
                        {item.label}
                        <IconChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === item.id && "rotate-180")} />
                      </button>

                      {openDropdown === item.id && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-background border rounded-md shadow-lg py-1 animate-fade-in">
                          {item.children!.map((child) => (
                            <Link
                              key={child.id}
                              href={child.url || "#"}
                              target={child.open_in_new_tab ? "_blank" : undefined}
                              rel={child.open_in_new_tab ? "noopener noreferrer" : undefined}
                              onClick={() => setOpenDropdown(null)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                              {child.label}
                              {child.open_in_new_tab && <IconExternalLink className="h-3 w-3" />}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.url || "#"}
                    target={item.open_in_new_tab ? "_blank" : undefined}
                    rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                  >
                    {item.label}
                    {item.open_in_new_tab && <IconExternalLink className="h-3 w-3" />}
                  </Link>
                );
              })}
            </div>

            <Link
              href="/feed.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex"
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-md h-8 w-8"
                aria-label={t('rss_feed')}
              >
                <IconRss className="h-4 w-4" />
              </Button>
            </Link>

            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="rounded-md h-8 w-8"
                aria-label={t('toggle_theme')}
              >
                {resolvedTheme === "dark" ? (
                  <IconSun className="h-4 w-4" />
                ) : (
                  <IconMoon className="h-4 w-4" />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-md h-8 w-8"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t('toggle_menu')}
            >
              {mobileMenuOpen ? (
                <IconX className="h-4 w-4" />
              ) : (
                <IconMenu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t animate-fade-in">
            <div className="flex flex-col gap-1">
              {defaultNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}

              {menuTree.map((item) => {
                const isDropdown = !item.page_id && !item.url && item.children && item.children.length > 0;

                if (isDropdown) {
                  const isOpen = mobileOpenDropdown === item.id;
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => setMobileOpenDropdown(isOpen ? null : item.id)}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                      >
                        {item.label}
                        <IconChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                      </button>
                      {isOpen && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.children!.map((child) => (
                            <Link
                              key={child.id}
                              href={child.url || "#"}
                              target={child.open_in_new_tab ? "_blank" : undefined}
                              rel={child.open_in_new_tab ? "noopener noreferrer" : undefined}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                            >
                              {child.label}
                              {child.open_in_new_tab && <IconExternalLink className="h-3 w-3" />}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.url || "#"}
                    target={item.open_in_new_tab ? "_blank" : undefined}
                    rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                  >
                    {item.label}
                    {item.open_in_new_tab && <IconExternalLink className="h-3 w-3" />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
