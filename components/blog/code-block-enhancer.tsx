"use client";

import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockEnhancerProps {
  children: React.ReactNode;
  className?: string;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "absolute top-2 right-2 p-1.5 rounded-md transition-all",
        "bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground",
        "opacity-0 group-hover:opacity-100",
        copied && "bg-green-500/20 text-green-500"
      )}
      aria-label={copied ? "Copied!" : "Copy code"}
    >
      {copied ? (
        <Check className="w-4 h-4" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

export function CodeBlockEnhancer({ children, className }: CodeBlockEnhancerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !mounted) return;

    const codeBlocks = containerRef.current.querySelectorAll("pre code");

    codeBlocks.forEach((block) => {
      if (block.getAttribute("data-highlighted") === "yes") return;

      hljs.highlightElement(block as HTMLElement);
      block.setAttribute("data-highlighted", "yes");

      const pre = block.parentElement;
      if (!pre || pre.querySelector(".copy-button-wrapper")) return;

      pre.style.position = "relative";
      pre.classList.add("group");

      const wrapper = document.createElement("div");
      wrapper.className = "copy-button-wrapper";

      const copyBtn = document.createElement("button");
      copyBtn.className =
        "absolute top-2 right-2 p-1.5 rounded-md transition-all bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100";
      copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
      copyBtn.setAttribute("aria-label", "Copy code");

      copyBtn.addEventListener("click", async () => {
        const code = block.textContent || "";
        try {
          await navigator.clipboard.writeText(code);
          copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
          copyBtn.classList.add("bg-green-500/20", "text-green-500");
          setTimeout(() => {
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
            copyBtn.classList.remove("bg-green-500/20", "text-green-500");
          }, 2000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
      });

      wrapper.appendChild(copyBtn);
      pre.appendChild(wrapper);
    });
  }, [mounted, children]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
