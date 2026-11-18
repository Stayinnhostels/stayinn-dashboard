import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma: Status chip (181:7242) — tint fill, tinted border, full-strength text + 6px dot.
 * Figma variants map to tones: Available → success · Full → brand · Maintenance → warning · Booked → info.
 */
export const statusChipVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-geist text-label font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        success: "border-success bg-success-tint text-success",
        brand: "border-brand-text bg-brand-tint text-brand-text",
        warning: "border-warning bg-warning-tint text-warning",
        info: "border-info bg-info-tint text-info",
        danger: "border-danger bg-danger-tint text-danger",
        neutral: "border-glass-stroke bg-glass-inset text-ink-2",
      },
    },
    defaultVariants: { tone: "success" },
  },
);

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusChipVariants> {
  /** Hide the leading dot. */
  hideDot?: boolean;
}

export function StatusChip({ className, tone, hideDot, children, ...props }: StatusChipProps) {
  return (
    <span className={cn(statusChipVariants({ tone }), className)} {...props}>
      {hideDot ? null : <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/**
 * Figma: Amenity chip (181:7255) — selectable 36px pill with a check circle.
 * Rendered as a toggle button (aria-pressed).
 */
export interface AmenityChipProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> {
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}

export function AmenityChip({
  selected = false,
  onSelectedChange,
  className,
  children,
  onClick,
  ...props
}: AmenityChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) onSelectedChange?.(!selected);
      }}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-full pr-3.5 pl-2.5 font-geist text-body font-medium whitespace-nowrap transition-colors",
        "outline-none focus-visible:ring-2 focus-visible:ring-brand-border",
        selected
          ? "border border-brand-border bg-brand-tint text-ink"
          : "glass-2 text-ink-2 hover:text-ink",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-[18px] shrink-0 items-center justify-center rounded-full",
          selected ? "bg-brand text-on-brand" : "border-[1.5px] border-ink-3",
        )}
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
      {children}
    </button>
  );
}

/** Figma: Info pill (181:7263) — neutral inset pill for prices / meta. */
export function InfoPill({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "glass-inset inline-flex shrink-0 items-center rounded-full px-3 py-1.5 font-geist text-label font-medium whitespace-nowrap text-ink",
        className,
      )}
      {...props}
    />
  );
}

/** Solid danger count badge used on nav items ("12", "2"). */
export function CountBadge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-danger-solid px-[7px] py-0.5 font-geist text-label font-medium text-on-brand",
        className,
      )}
      {...props}
    />
  );
}

/** Small brand-tint role tag, e.g. "Super Admin" in the account chip. */
export function RoleTag({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-brand-tint px-1.5 py-px font-geist text-label font-medium whitespace-nowrap text-brand-text",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Figma: Tag (186:9862) — small status tag (12/16 medium, 8×2 padding).
 * Smaller than StatusChip; used in auth cards and tables.
 */
export const tagVariants = cva(
  "inline-flex shrink-0 items-center gap-[5px] rounded-full border px-2 py-0.5 font-geist text-label font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        brand: "border-brand-text bg-brand-tint text-brand-text",
        neutral: "border-ink-2 bg-glass-inset text-ink-2",
        warning: "border-warning bg-warning-tint text-warning",
        success: "border-success bg-success-tint text-success",
        danger: "border-danger bg-danger-tint text-danger",
      },
    },
    defaultVariants: { tone: "brand" },
  },
);

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof tagVariants> {
  showDot?: boolean;
}

export function Tag({ className, tone, showDot, children, ...props }: TagProps) {
  return (
    <span className={cn(tagVariants({ tone }), className)} {...props}>
      {showDot ? <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
