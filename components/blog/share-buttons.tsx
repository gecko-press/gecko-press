"use client";

import { useState } from "react";
import { Facebook, Twitter, Linkedin, Link2, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareButtons({ url, title, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      color: "hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={cn("flex items-center gap-2 mb-8", className)}>
      <span className="text-sm font-medium">Share:</span>
      {shareLinks.map((link) => {
        const Icon = link.icon;
        return (
          <Button
            key={link.name}
            variant="outline"
            size="icon"
            className={cn("h-8 w-8 transition-colors", link.color)}
            asChild
          >
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${link.name}`}
            >
              <Icon className="w-4 h-4" />
            </a>
          </Button>
        );
      })}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-8 w-8 transition-colors",
          copied ? "bg-green-500 text-white border-green-500" : "hover:bg-muted"
        )}
        onClick={handleCopy}
        aria-label="Copy link"
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </Button>
    </div>
  );
}
