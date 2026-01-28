"use client";

import { useRef, useEffect, useCallback } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, Undo, Redo, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type PageEditorProps = {
  content: string;
  onChange: (content: string) => void;
};

export function PageEditor({ content, onChange }: PageEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (editorRef.current && isInitialMount.current) {
      editorRef.current.innerHTML = content;
      isInitialMount.current = false;
    }
  }, [content]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  function execCommand(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }

  function insertLink() {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  }

  function formatBlock(tag: string) {
    execCommand("formatBlock", tag);
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
        <ToolbarButton onClick={() => execCommand("undo")} title="Undo">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("redo")} title="Redo">
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={() => formatBlock("h1")} title="Heading 1">
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock("h2")} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock("h3")} title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock("p")} title="Paragraph">
          <span className="text-xs font-medium">P</span>
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={() => execCommand("bold")} title="Bold">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("italic")} title="Italic">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("underline")} title="Underline">
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatBlock("pre")} title="Code Block">
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={() => execCommand("insertUnorderedList")} title="Bullet List">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("insertOrderedList")} title="Numbered List">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={() => execCommand("justifyLeft")} title="Align Left">
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("justifyCenter")} title="Align Center">
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("justifyRight")} title="Align Right">
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={insertLink} title="Insert Link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[400px] p-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none prose prose-zinc dark:prose-invert max-w-none
          [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:mt-6
          [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h2]:mt-5
          [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-4
          [&>p]:mb-4
          [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4
          [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4
          [&>pre]:bg-zinc-100 [&>pre]:dark:bg-zinc-800 [&>pre]:p-4 [&>pre]:rounded-md [&>pre]:mb-4 [&>pre]:overflow-x-auto
          [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline"
        suppressContentEditableWarning
      />
    </div>
  );
}

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );
}
