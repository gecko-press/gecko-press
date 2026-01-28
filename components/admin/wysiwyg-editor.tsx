"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Youtube from "@tiptap/extension-youtube";
import { Node, mergeAttributes } from "@tiptap/core";

const Iframe = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      width: { default: null },
      height: { default: null },
      frameborder: { default: "0" },
      allow: { default: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" },
      allowfullscreen: { default: true },
    };
  },
  parseHTML() {
    return [{ tag: "iframe" }];
  },
  renderHTML({ node }) {
    return [
      "div",
      { class: "iframe-wrapper", style: "position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; margin: 1rem 0;" },
      [
        "iframe",
        {
          src: node.attrs.src,
          frameborder: "0",
          allow: node.attrs.allow,
          allowfullscreen: node.attrs.allowfullscreen,
          style: "position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;",
        },
      ],
    ];
  },
});

const MediaEmbed = Node.create({
  name: "mediaEmbed",
  group: "block",
  content: "block*",
  defining: true,
  addAttributes() {
    return {
      class: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div.media-embed' }, { tag: 'div.youtube-embed' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ ...HTMLAttributes, style: "margin: 1rem 0;" }), 0];
  },
});
import { useEffect, useCallback, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  RemoveFormatting,
  Table as TableIcon,
  Youtube as YoutubeIcon,
  Plus,
  Trash2,
} from "lucide-react";

interface WysiwygEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}

function ToolbarButton({ onClick, active, disabled, children, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${active
        ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1" />;
}

export function WysiwygEditor({ content, onChange, placeholder = "Start writing..." }: WysiwygEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 dark:text-blue-400 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: "w-full aspect-video",
        },
      }),
      Iframe,
      MediaEmbed,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor || !linkUrl) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setShowImageInput(false);
  }, [editor, imageUrl]);

  const addYoutube = useCallback(() => {
    if (!editor || !youtubeUrl) return;
    editor.commands.setYoutubeVideo({ src: youtubeUrl });
    setYoutubeUrl("");
    setShowYoutubeInput(false);
  }, [editor, youtubeUrl]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    setShowTableMenu(false);
  }, [editor]);

  if (!editor) {
    return (
      <div className="w-full min-h-[400px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md animate-pulse" />
    );
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden bg-white dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <div className="relative">
          <ToolbarButton
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                setShowLinkInput(!showLinkInput);
                setShowImageInput(false);
              }
            }}
            active={editor.isActive("link")}
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 z-50 flex gap-1 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-48 h-7 px-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLink();
                  }
                  if (e.key === "Escape") {
                    setShowLinkInput(false);
                    setLinkUrl("");
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={addLink}
                className="px-2 h-7 text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded hover:bg-zinc-700 dark:hover:bg-zinc-300"
              >
                Add
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <ToolbarButton
            onClick={() => {
              setShowImageInput(!showImageInput);
              setShowLinkInput(false);
            }}
            title="Image"
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
          {showImageInput && (
            <div className="absolute top-full left-0 mt-1 z-50 flex gap-1 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL..."
                className="w-48 h-7 px-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                  if (e.key === "Escape") {
                    setShowImageInput(false);
                    setImageUrl("");
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={addImage}
                className="px-2 h-7 text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded hover:bg-zinc-700 dark:hover:bg-zinc-300"
              >
                Add
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <ToolbarButton
            onClick={() => {
              setShowYoutubeInput(!showYoutubeInput);
              setShowLinkInput(false);
              setShowImageInput(false);
              setShowTableMenu(false);
            }}
            title="YouTube Video"
          >
            <YoutubeIcon className="w-4 h-4" />
          </ToolbarButton>
          {showYoutubeInput && (
            <div className="absolute top-full left-0 mt-1 z-50 flex gap-1 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg">
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="YouTube URL..."
                className="w-56 h-7 px-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-zinc-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addYoutube();
                  }
                  if (e.key === "Escape") {
                    setShowYoutubeInput(false);
                    setYoutubeUrl("");
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={addYoutube}
                className="px-2 h-7 text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded hover:bg-zinc-700 dark:hover:bg-zinc-300"
              >
                Add
              </button>
            </div>
          )}
        </div>

        <ToolbarDivider />

        <div className="relative">
          <ToolbarButton
            onClick={() => {
              setShowTableMenu(!showTableMenu);
              setShowLinkInput(false);
              setShowImageInput(false);
              setShowYoutubeInput(false);
            }}
            active={editor.isActive("table")}
            title="Table"
          >
            <TableIcon className="w-4 h-4" />
          </ToolbarButton>
          {showTableMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg min-w-[160px]">
              <button
                type="button"
                onClick={insertTable}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
              >
                <Plus className="w-3 h-3" />
                Insert Table (3x3)
              </button>
              {editor.isActive("table") && (
                <>
                  <div className="my-1 border-t border-zinc-200 dark:border-zinc-700" />
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addColumnAfter().run();
                      setShowTableMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
                  >
                    Add Column
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().addRowAfter().run();
                      setShowTableMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
                  >
                    Add Row
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteColumn().run();
                      setShowTableMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-red-600 dark:text-red-400"
                  >
                    Delete Column
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteRow().run();
                      setShowTableMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-red-600 dark:text-red-400"
                  >
                    Delete Row
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().deleteTable().run();
                      setShowTableMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete Table
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #a1a1aa;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .dark .ProseMirror p.is-editor-empty:first-child::before {
          color: #71717a;
        }
        .ProseMirror p:has(> br.ProseMirror-trailingBreak:only-child) {
          margin: 0;
          padding: 0;
          min-height: 0;
          line-height: 0;
          font-size: 0;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
        }
        .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
        }
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1em 0;
          overflow: hidden;
        }
        .ProseMirror table td,
        .ProseMirror table th {
          min-width: 1em;
          border: 1px solid #d4d4d8;
          padding: 8px 12px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .dark .ProseMirror table td,
        .dark .ProseMirror table th {
          border-color: #3f3f46;
        }
        .ProseMirror table th {
          font-weight: 600;
          text-align: left;
          background-color: #f4f4f5;
        }
        .dark .ProseMirror table th {
          background-color: #27272a;
        }
        .ProseMirror table .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background: rgba(59, 130, 246, 0.2);
          pointer-events: none;
        }
        .ProseMirror table .column-resize-handle {
          position: absolute;
          right: -2px;
          top: 0;
          bottom: -2px;
          width: 4px;
          background-color: #3b82f6;
          pointer-events: none;
        }
        .ProseMirror .tableWrapper {
          overflow-x: auto;
          margin: 1em 0;
        }
        .ProseMirror iframe {
          border: 0;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 8px;
          margin: 1em 0;
        }
        .ProseMirror div[data-youtube-video] {
          margin: 1em 0;
        }
        .ProseMirror div[data-youtube-video] iframe {
          display: block;
        }
        .ProseMirror div[data-youtube-video].ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
