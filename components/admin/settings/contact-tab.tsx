"use client";

import { Mail, MapPin, Twitter, Github, Linkedin, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SocialLinks = {
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
};

type ContactSettings = {
  contact_email: string;
  contact_address: string;
  social_links: SocialLinks;
};

type ContactTabProps = {
  settings: ContactSettings;
  onChange: (settings: ContactSettings) => void;
};

export function ContactTab({ settings, onChange }: ContactTabProps) {
  function updateSocialLink(key: keyof SocialLinks, value: string) {
    onChange({
      ...settings,
      social_links: {
        ...settings.social_links,
        [key]: value,
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Contact Email</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Public email address for contact inquiries
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email" className="text-xs text-zinc-600 dark:text-zinc-400">
            Email Address
          </Label>
          <Input
            id="contact-email"
            type="email"
            value={settings.contact_email}
            onChange={(e) => onChange({ ...settings, contact_email: e.target.value })}
            placeholder="contact@yoursite.com"
            className="bg-zinc-50 dark:bg-zinc-800/50"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Address</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Physical address (optional)
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-address" className="text-xs text-zinc-600 dark:text-zinc-400">
            Address
          </Label>
          <Textarea
            id="contact-address"
            value={settings.contact_address}
            onChange={(e) => onChange({ ...settings, contact_address: e.target.value })}
            placeholder="123 Main Street&#10;City, Country 12345"
            className="bg-zinc-50 dark:bg-zinc-800/50 min-h-[80px]"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Social Links</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Your social media profiles
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="social-twitter" className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <Twitter className="w-3 h-3" />
              Twitter / X
            </Label>
            <Input
              id="social-twitter"
              value={settings.social_links?.twitter || ""}
              onChange={(e) => updateSocialLink("twitter", e.target.value)}
              placeholder="https://twitter.com/username"
              className="bg-zinc-50 dark:bg-zinc-800/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-github" className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <Github className="w-3 h-3" />
              GitHub
            </Label>
            <Input
              id="social-github"
              value={settings.social_links?.github || ""}
              onChange={(e) => updateSocialLink("github", e.target.value)}
              placeholder="https://github.com/username"
              className="bg-zinc-50 dark:bg-zinc-800/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-linkedin" className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <Linkedin className="w-3 h-3" />
              LinkedIn
            </Label>
            <Input
              id="social-linkedin"
              value={settings.social_links?.linkedin || ""}
              onChange={(e) => updateSocialLink("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="bg-zinc-50 dark:bg-zinc-800/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-website" className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              Website
            </Label>
            <Input
              id="social-website"
              value={settings.social_links?.website || ""}
              onChange={(e) => updateSocialLink("website", e.target.value)}
              placeholder="https://yourwebsite.com"
              className="bg-zinc-50 dark:bg-zinc-800/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
