import { cn } from "@/lib/utils";
import "./rich-text-editor.css";

/** Read-only rendering of a saved description (server HTML, falls back to plain text). */
export function RichTextView({ html, text, className }: { html?: string | null; text?: string | null; className?: string }) {
  if (html) return <div className={cn("gl-prose", className)} dangerouslySetInnerHTML={{ __html: html }} />;
  return <p className={cn("gl-prose whitespace-pre-line", className)}>{text}</p>;
}
