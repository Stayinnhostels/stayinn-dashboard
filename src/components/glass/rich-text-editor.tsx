import { useEffect, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Check,
  Heading2,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Maximize2,
  Redo2,
  Strikethrough,
  TextQuote,
  Undo2,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "./rich-text-editor.css";

/**
 * Figma "Editor / Rich text" (564:96076): toolbar, formatted text, footer with tips + counter.
 * Saves Markdown, so old plain-text values load as normal paragraphs.
 * - size "inline": compact, inside a form; shows an expand button when `onExpand` is given.
 * - size "full": tall, for the full editor modal; the counter also shows words.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  maxLength,
  size = "inline",
  onExpand,
  autoFocus,
  id,
  invalid,
  describedBy,
  className,
}: {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  maxLength?: number;
  size?: "inline" | "full";
  onExpand?: () => void;
  autoFocus?: boolean;
  id?: string;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}) {
  const full = size === "full";
  // Last Markdown we emitted, so outside changes (reset, other editor) can be told apart.
  const lastEmitted = useRef(value);
  const [linkOpen, setLinkOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        underline: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["http", "https", "mailto", "tel"],
        },
      }),
      Markdown,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value,
    contentType: "markdown",
    autofocus: autoFocus ? "end" : false,
    editorProps: {
      attributes: {
        class: "gl-prose",
        role: "textbox",
        "aria-multiline": "true",
        ...(id ? { id } : {}),
        ...(invalid ? { "aria-invalid": "true" } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      },
      handleKeyDown: (_view, e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          setLinkOpen(true);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const md = editor.isEmpty ? "" : editor.getMarkdown();
      lastEmitted.current = md;
      onChange(md);
    },
  });

  // Value changed from outside (form reset, the other editor) → load it.
  useEffect(() => {
    if (!editor || value === lastEmitted.current) return;
    lastEmitted.current = value;
    editor.commands.setContent(value, { contentType: "markdown", emitUpdate: false });
  }, [editor, value]);

  const chars = value.length;
  const words = useWordCount(editor);
  const over = maxLength != null && chars > maxLength;

  return (
    <div
      className={cn(
        "gl-rte glass-2 flex flex-col overflow-hidden rounded-[14px] bg-glass-inset! transition-colors",
        "focus-within:border-brand-border focus-within:ring-2 focus-within:ring-brand-tint",
        (invalid || over) && "border-danger focus-within:ring-danger-tint",
        className,
      )}
    >
      {editor ? (
        linkOpen ? (
          <LinkBar editor={editor} onClose={() => setLinkOpen(false)} />
        ) : (
          <Toolbar editor={editor} onLink={() => setLinkOpen(true)} onExpand={full ? undefined : onExpand} />
        )
      ) : (
        <div className="h-[41px] border-b border-glass-divider" />
      )}
      <EditorContent
        editor={editor}
        className={cn(
          "min-h-0 cursor-text overflow-y-auto px-3.5 pt-3 pb-2 [&_.ProseMirror]:min-h-full",
          full ? "h-[min(440px,calc(92svh-360px))] min-h-[220px]" : "h-28",
        )}
        onClick={() => editor?.commands.focus()}
      />
      <div className="flex items-center gap-2 px-3.5 pt-0.5 pb-2.5 text-label text-ink-3">
        <span className="min-w-0 flex-1 truncate">
          {full ? "Tip: type ## for a heading, - for a list, ⌘B bold, ⌘K link" : "⌘B bold · ⌘I italic · - list"}
        </span>
        <span className={cn("shrink-0 tabular-nums", over && "font-medium text-danger")}>
          {full ? `${words} ${words === 1 ? "word" : "words"} · ` : ""}
          {maxLength != null ? `${chars} / ${maxLength}` : chars}
        </span>
      </div>
    </div>
  );
}

function useWordCount(editor: Editor | null) {
  return (
    useEditorState({
      editor,
      selector: ({ editor }) => {
        if (!editor) return 0;
        const t = editor.state.doc.textBetween(0, editor.state.doc.content.size, " ", " ").trim();
        return t ? t.split(/\s+/).length : 0;
      },
    }) ?? 0
  );
}

/* ───────────────────────── Toolbar ───────────────────────── */

function Toolbar({ editor, onLink, onExpand }: { editor: Editor; onLink: () => void; onExpand?: () => void }) {
  const s = useEditorState({
    editor,
    selector: ({ editor }) => ({
      h2: editor.isActive("heading", { level: 2 }),
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      strike: editor.isActive("strike"),
      bullet: editor.isActive("bulletList"),
      ordered: editor.isActive("orderedList"),
      quote: editor.isActive("blockquote"),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });
  const run = (fn: (c: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) => fn(editor.chain().focus()).run();

  return (
    <div role="toolbar" aria-label="Text formatting" className="flex items-center gap-0.5 overflow-x-auto border-b border-glass-divider px-1.5 py-[5px]">
      <Tool icon={Heading2} label="Heading" active={s.h2} onClick={() => run((c) => c.toggleHeading({ level: 2 }))} />
      <Tool icon={Bold} label="Bold (⌘B)" active={s.bold} onClick={() => run((c) => c.toggleBold())} />
      <Tool icon={Italic} label="Italic (⌘I)" active={s.italic} onClick={() => run((c) => c.toggleItalic())} />
      <Tool icon={Strikethrough} label="Strikethrough" active={s.strike} onClick={() => run((c) => c.toggleStrike())} />
      <Sep />
      <Tool icon={List} label="Bulleted list" active={s.bullet} onClick={() => run((c) => c.toggleBulletList())} />
      <Tool icon={ListOrdered} label="Numbered list" active={s.ordered} onClick={() => run((c) => c.toggleOrderedList())} />
      <Tool icon={TextQuote} label="Quote" active={s.quote} onClick={() => run((c) => c.toggleBlockquote())} />
      <Tool icon={Link2} label="Link (⌘K)" active={s.link} onClick={onLink} />
      <Sep />
      <Tool icon={Undo2} label="Undo (⌘Z)" disabled={!s.canUndo} onClick={() => run((c) => c.undo())} />
      <Tool icon={Redo2} label="Redo (⇧⌘Z)" disabled={!s.canRedo} onClick={() => run((c) => c.redo())} />
      <span className="flex-1" />
      {onExpand ? <Tool icon={Maximize2} label="Open full editor" onClick={onExpand} /> : null}
    </div>
  );
}

function Tool({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active ?? undefined}
      disabled={disabled}
      // Keep the text selection while clicking a tool.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex size-[30px] shrink-0 items-center justify-center rounded-[8px] transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-brand-tint disabled:opacity-35",
        active ? "bg-brand-tint text-brand-text" : "text-ink-2 hover:bg-glass-1 hover:text-ink",
      )}
    >
      <Icon className="size-4" strokeWidth={2} />
      {children}
    </button>
  );
}

const Sep = () => <span aria-hidden className="mx-1 h-[18px] w-px shrink-0 bg-glass-divider" />;

/* ───────────────────────── Link bar ───────────────────────── */

function LinkBar({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [url, setUrl] = useState(() => (editor.getAttributes("link").href as string | undefined) ?? "");
  const hasLink = editor.isActive("link");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);

  const apply = () => {
    let href = url.trim();
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return onClose();
    }
    if (!/^(https?:\/\/|mailto:|tel:)/i.test(href)) href = `https://${href}`;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (editor.state.selection.empty && !hasLink) {
      // Nothing selected: insert the address itself as the link text.
      chain.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
    } else {
      chain.setLink({ href }).run();
    }
    onClose();
  };

  return (
    // data-rte-keep-esc: dialogs leave Escape to this bar (it closes the bar, not the dialog).
    <div data-rte-keep-esc className="flex items-center gap-1.5 border-b border-glass-divider px-1.5 py-[5px]">
      <Link2 className="ml-1.5 size-4 shrink-0 text-ink-3" />
      <input
        ref={input}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          } else if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            onClose();
            editor.commands.focus();
          }
        }}
        placeholder="Paste a link, e.g. https://stayinn.pk/rules"
        aria-label="Link address"
        className="h-[30px] min-w-0 flex-1 bg-transparent font-geist text-body text-ink outline-none placeholder:text-ink-3"
      />
      <Tool icon={Check} label="Apply link" onClick={apply} />
      {hasLink ? (
        <Tool
          icon={Link2Off}
          label="Remove link"
          onClick={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            onClose();
          }}
        />
      ) : null}
      <Tool
        icon={X}
        label="Cancel"
        onClick={() => {
          onClose();
          editor.commands.focus();
        }}
      />
    </div>
  );
}
