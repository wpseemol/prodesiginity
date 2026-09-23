import { useEffect, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  Redo2Icon,
  Undo2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function paragraphsToHtml(lines: string[]) {
  const items = lines.map((l) => l.trim()).filter(Boolean);
  if (!items.length) return "<p></p>";
  return items.map((l) => `<p>${escapeHtml(l)}</p>`).join("");
}

export function htmlToParagraphs(html: string) {
  if (typeof document === "undefined") {
    return html
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const paragraphs = [...doc.querySelectorAll("p")]
    .map((p) => (p.textContent ?? "").trim())
    .filter(Boolean);
  if (paragraphs.length) return paragraphs;
  const text = (doc.body.textContent ?? "").trim();
  return text ? [text] : [];
}

export function listToHtml(items: string[]) {
  const rows = items.map((l) => l.trim()).filter(Boolean);
  if (!rows.length) return "<ul><li><p></p></li></ul>";
  return `<ul>${rows.map((l) => `<li><p>${escapeHtml(l)}</p></li>`).join("")}</ul>`;
}

export function htmlToList(html: string) {
  if (typeof document === "undefined") return [];
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const lis = [...doc.querySelectorAll("li")]
    .map((li) => (li.textContent ?? "").trim())
    .filter(Boolean);
  if (lis.length) return lis;
  return htmlToParagraphs(html);
}

export function textToHtml(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "<p></p>";
  return `<p>${escapeHtml(trimmed)}</p>`;
}

export function htmlToText(html: string) {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

type SimpleEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  listMode?: boolean;
  minHeight?: string;
};

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "secondary" : "ghost"}
      className="size-8 p-0"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function SimpleEditor({
  value,
  onChange,
  placeholder = "Write here…",
  className,
  listMode = false,
  minHeight = "120px",
}: SimpleEditorProps) {
  const empty = listMode ? "<ul><li><p></p></li></ul>" : "<p></p>";

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || empty,
    editorProps: {
      attributes: {
        class: cn(
          "tiptap max-w-none px-3 py-2.5 text-sm leading-relaxed focus:outline-none",
          "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_p]:my-1 [&_li]:my-0.5",
        ),
        style: `min-height:${minHeight}`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || empty;
    if (editor.getHTML() === next) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [value, editor, empty]);

  if (!editor) {
    return (
      <div
        className={cn(
          "rounded-xl border border-input bg-muted/20",
          className,
        )}
        style={{ minHeight }}
      />
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-input bg-background shadow-xs",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/70 bg-muted/30 px-1.5 py-1">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Paragraph"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <PilcrowIcon className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListIcon className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrderedIcon className="size-3.5" />
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2Icon className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2Icon className="size-3.5" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
