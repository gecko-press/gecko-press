"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Moon, Sun, Menu, X, Home, LayoutGrid, ChevronDown, ExternalLink, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  children?: MenuItem[];
};

const defaultNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Categories", href: "/categories", icon: LayoutGrid },
];

export function Header() {
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
          <Link href="/" className="gap-2 group">
            <img src={logoUrl} alt="Logo" className="h-12" />
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
                        <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === item.id && "rotate-180")} />
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
                              {child.open_in_new_tab && <ExternalLink className="h-3 w-3" />}
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
                    {item.open_in_new_tab && <ExternalLink className="h-3 w-3" />}
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
                aria-label="RSS Feed"
              >
                <Rss className="h-4 w-4" />
              </Button>
            </Link>

            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="rounded-md h-8 w-8"
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-md h-8 w-8"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
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
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
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
                              {child.open_in_new_tab && <ExternalLink className="h-3 w-3" />}
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
                    {item.open_in_new_tab && <ExternalLink className="h-3 w-3" />}
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
