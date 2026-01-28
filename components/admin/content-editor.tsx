"use client";

import { useState } from "react";
import { Code, Type } from "lucide-react";
import { WysiwygEditor } from "./wysiwyg-editor";

interface ContentEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

function formatHtml(html: string): string {
  if (!html) return html;

  let formatted = "";
  let indent = 0;
  const tab = "  ";

  const selfClosingTags = ["br", "hr", "img", "input", "meta", "link", "area", "base", "col", "embed", "param", "source", "track", "wbr"];
  const inlineTags = ["a", "abbr", "b", "bdo", "br", "cite", "code", "dfn", "em", "i", "img", "kbd", "mark", "q", "s", "samp", "small", "span", "strong", "sub", "sup", "time", "u", "var"];

  html = html.replace(/>\s+</g, "><");

  const tokens: string[] = [];
  let current = "";
  let inTag = false;

  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    if (char === "<") {
      if (current.trim()) {
        tokens.push(current);
      }
      current = "<";
      inTag = true;
    } else if (char === ">") {
      current += ">";
      tokens.push(current);
      current = "";
      inTag = false;
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    tokens.push(current);
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.startsWith("</")) {
      indent = Math.max(0, indent - 1);
      const tagName = token.slice(2, -1).toLowerCase().split(/\s/)[0];
      if (inlineTags.includes(tagName)) {
        formatted += token;
      } else {
        formatted += "\n" + tab.repeat(indent) + token;
      }
    } else if (token.startsWith("<")) {
      const tagMatch = token.match(/^<([a-zA-Z0-9]+)/);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : "";
      const isSelfClosing = selfClosingTags.includes(tagName) || token.endsWith("/>");
      const isInline = inlineTags.includes(tagName);

      if (isInline) {
        if (formatted.endsWith("\n" + tab.repeat(indent))) {
          formatted += token;
        } else if (formatted === "" || formatted.endsWith("\n")) {
          formatted += tab.repeat(indent) + token;
        } else {
          formatted += token;
        }
      } else {
        if (formatted !== "") {
          formatted += "\n" + tab.repeat(indent) + token;
        } else {
          formatted += token;
        }
        if (!isSelfClosing) {
          indent++;
        }
      }
    } else {
      const trimmed = token.trim();
      if (trimmed) {
        if (formatted.endsWith(">")) {
          const lastTag = formatted.match(/<([a-zA-Z0-9]+)[^>]*>$/);
          if (lastTag && inlineTags.includes(lastTag[1].toLowerCase())) {
            formatted += trimmed;
          } else {
            formatted += "\n" + tab.repeat(indent) + trimmed;
          }
        } else {
          formatted += trimmed;
        }
      }
    }
  }

  return formatted.trim();
}

export function ContentEditor({ content, onContentChange }: ContentEditorProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "html">("visual");
  const [htmlSource, setHtmlSource] = useState(() => formatHtml(content));

  const handleTabChange = (tab: "visual" | "html") => {
    if (tab === "html" && activeTab === "visual") {
      setHtmlSource(formatHtml(content));
    }
    setActiveTab(tab);
  };

  const handleHtmlChange = (value: string) => {
    setHtmlSource(value);
    onContentChange(value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Content
        </label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => handleTabChange("visual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === "visual"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
          >
            <Type className="w-3.5 h-3.5" />
            Visual
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("html")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === "html"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
          >
            <Code className="w-3.5 h-3.5" />
            HTML
          </button>
        </div>
      </div>

      {activeTab === "visual" && (
        <div className="space-y-1.5">
          <WysiwygEditor
            content={content}
            onChange={onContentChange}
            placeholder="Start writing your content..."
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Use the toolbar to format text, add images, and more
          </p>
        </div>
      )}

      {activeTab === "html" && (
        <div className="space-y-2">
          <textarea
            value={htmlSource}
            onChange={(e) => handleHtmlChange(e.target.value)}
            placeholder="<p>Your post content here...</p>"
            rows={16}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[300px]"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Edit raw HTML directly. Switch to Visual tab to see changes.
          </p>
        </div>
      )}
    </div>
  );
}
