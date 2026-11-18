import * as React from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma: Field (181:7322) — 44px glass-2 input, label above, required marked *.
 * Error shows danger border + helper text.
 */
const controlBase = cn(
  "glass-2 h-11 w-full rounded-[14px] px-3.5 font-geist text-body text-ink transition-colors",
  "placeholder:text-ink-3 outline-none focus-visible:border-brand-border focus-visible:ring-2 focus-visible:ring-brand-tint",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger-tint",
);

export interface GlassFieldProps {
  label?: React.ReactNode;
  required?: boolean;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  /** Receives the id / aria props to spread onto the control. */
  children: (props: {
    id: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
    required?: boolean;
  }) => React.ReactNode;
}

export function GlassField({ label, required, error, hint, className, children }: GlassFieldProps) {
  const id = React.useId();
  const helpId = `${id}-help`;
  const help = error ?? hint;
  return (
    <div className={cn("flex flex-col gap-1.5 font-geist", className)}>
      {label ? (
        <label htmlFor={id} className="flex gap-0.5 text-label font-medium text-ink-2">
          {label}
          {required ? (
            <span aria-hidden className="text-danger">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": help ? helpId : undefined,
        required,
      })}
      {help ? (
        <p
          id={helpId}
          className={cn("text-label font-medium", error ? "text-danger" : "text-ink-3")}
        >
          {help}
        </p>
      ) : null}
    </div>
  );
}

export const GlassInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(controlBase, className)} {...props} />
  ),
);
GlassInput.displayName = "GlassInput";

export const GlassTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(controlBase, "h-auto min-h-24 py-3", className)} {...props} />
));
GlassTextarea.displayName = "GlassTextarea";

/** Native select styled as the Figma "Select" field variant (chevron-down, 18px). */
export const GlassSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => (
    <div className="relative w-full">
      <select ref={ref} className={cn(controlBase, "appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3.5 size-[18px] -translate-y-1/2 text-ink-2"
      />
    </div>
  ),
);
GlassSelect.displayName = "GlassSelect";

/** Sidebar search (40px inset well, ⌘K hint). */
export const GlassSearch = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { shortcut?: string }
>(({ className, shortcut = "⌘K", placeholder = "Search", ...props }, ref) => (
  <label
    className={cn(
      "glass-inset flex h-10 w-full items-center gap-2.5 rounded-[12px] px-3 font-geist",
      "focus-within:border-brand-border",
      className,
    )}
  >
    <Search aria-hidden className="size-4 shrink-0 text-ink-3" />
    <input
      ref={ref}
      type="search"
      placeholder={placeholder}
      className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-3"
      {...props}
    />
    {shortcut ? <Kbd>{shortcut}</Kbd> : null}
  </label>
));
GlassSearch.displayName = "GlassSearch";

export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "glass-inset shrink-0 rounded-[6px] px-1.5 py-0.5 font-geist text-label font-medium text-ink-3",
        className,
      )}
      {...props}
    />
  );
}
