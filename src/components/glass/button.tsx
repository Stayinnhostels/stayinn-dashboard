import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-brand-border focus-visible:ring-offset-0";

/**
 * Figma: Button (181:7185)
 * Primary = main CTA · Glass = secondary · Ghost = tertiary/cancel · Danger = destructive.
 * MD = 40px / 14px radius / 18px icon · SM = 32px / 10px radius / 16px icon.
 */
export const glassButtonVariants = cva(
  cn(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-geist transition-[filter,background-color,opacity] select-none",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    focusRing,
  ),
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-on-brand shadow-brand-glow hover:brightness-110 active:brightness-95",
        glass: "glass-2 text-ink hover:bg-glass-inset active:brightness-95",
        ghost: "text-ink-2 hover:bg-glass-inset hover:text-ink",
        danger: "bg-danger-solid text-on-brand hover:brightness-110 active:brightness-95",
      },
      size: {
        md: "h-10 rounded-[14px] px-4 text-body font-semibold [&_svg]:size-[18px]",
        sm: "h-8 rounded-[10px] px-3 text-label font-medium [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof glassButtonVariants> {
  asChild?: boolean;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(glassButtonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
GlassButton.displayName = "GlassButton";

/**
 * Figma: Icon button (181:7210) — 40×40 touch-safe icon button, 12px radius, 18px icon.
 * `sm` (32px) matches the sidebar collapse control.
 */
export const glassIconButtonVariants = cva(
  cn(
    "relative inline-flex shrink-0 items-center justify-center rounded-[12px] transition-[filter,background-color]",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0",
    focusRing,
  ),
  {
    variants: {
      variant: {
        glass: "glass-2 text-ink hover:bg-glass-inset",
        danger: "border border-danger bg-danger-tint text-danger hover:brightness-110",
        primary: "bg-brand text-on-brand hover:brightness-110",
        ghost: "text-ink hover:bg-glass-inset",
      },
      size: {
        md: "size-10",
        sm: "size-8",
      },
    },
    defaultVariants: { variant: "glass", size: "md" },
  },
);

export interface GlassIconButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassIconButtonVariants> {
  /** Required for accessibility — icon-only buttons need a name. */
  "aria-label": string;
  /** Shows the small danger "unread" dot (top bar bell). */
  dot?: boolean;
}

export const GlassIconButton = React.forwardRef<HTMLButtonElement, GlassIconButtonProps>(
  ({ className, variant, size, dot, type, children, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(glassIconButtonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {dot ? (
        <span
          aria-hidden
          className="absolute top-[7px] left-[25px] size-[9px] rounded-full border-[1.5px] border-base bg-danger-solid"
        />
      ) : null}
    </button>
  ),
);
GlassIconButton.displayName = "GlassIconButton";
