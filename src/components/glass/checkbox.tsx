import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma: Checkbox (204:19898) — 20px, 6px radius. Off: inset fill + 1.5px tertiary border.
 * On: brand fill with a 13px white check. `indeterminate` shows a dash (select-all).
 */
export function GlassCheckbox({
  checked,
  indeterminate,
  onCheckedChange,
  className,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const on = checked || indeterminate;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={(e) => {
        e.stopPropagation();
        onCheckedChange?.(!checked);
      }}
      className={cn(
        "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[6px] outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-brand-border",
        on ? "bg-brand text-on-brand" : "border-[1.5px] border-ink-3 bg-glass-inset",
        className,
      )}
      {...props}
    >
      {indeterminate ? (
        <Minus className="size-[13px]" strokeWidth={3} aria-hidden />
      ) : checked ? (
        <Check className="size-[13px]" strokeWidth={3} aria-hidden />
      ) : null}
    </button>
  );
}
