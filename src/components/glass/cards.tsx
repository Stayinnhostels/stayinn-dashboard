import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/admin/dashboard/dashboard-motion";
import { GlassButton, GlassIconButton } from "./button";
import { StatusChip, type StatusChipProps } from "./chips";

/** Generic glass surface. level 1 = panel/shell, 2 = raised card, 3 = overlay. */
export const glassPanelVariants = cva("relative font-geist text-ink", {
  variants: {
    level: {
      1: "glass-1 rounded-[28px]",
      2: "glass-2 rounded-[20px]",
      3: "glass-3 rounded-[16px]",
    },
  },
  defaultVariants: { level: 2 },
});

export interface GlassPanelProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof glassPanelVariants> {}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, level, ...props }, ref) => (
    <div ref={ref} className={cn(glassPanelVariants({ level }), className)} {...props} />
  ),
);
GlassPanel.displayName = "GlassPanel";

/** Card header: title (Heading/Card title) + optional subtitle and right-side actions. */
export function GlassCardHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h3 className="text-card-title text-ink">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-label text-ink-2">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** 36px tinted icon tile used in KPI cards, notifications and toasts. */
export function IconTile({
  children,
  solid,
  className,
}: {
  children: React.ReactNode;
  /** Solid brand fill (toast) instead of brand tint. */
  solid?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-[10px] [&_svg]:size-[18px]",
        solid
          ? "bg-brand text-on-brand"
          : "border border-brand-border bg-brand-tint text-brand-text",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Thin progress bar (bed bar 4px, plan card 6px, toast 3px). */
export function GlassProgress({
  value,
  max = 100,
  height = 4,
  tone = "brand",
  className,
  "aria-label": ariaLabel,
}: {
  value: number;
  max?: number;
  height?: number;
  tone?: "brand" | "success" | "warning" | "danger";
  className?: string;
  "aria-label"?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const fill = {
    brand: "bg-brand",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger-solid",
  }[tone];
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
      className={cn("w-full overflow-hidden rounded-full bg-glass-inset", className)}
      style={{ height }}
    >
      <div
        className={cn("dash-fill h-full rounded-full transition-[width]", fill)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Figma: KPI card (181:7268) — glass-2, tinted icon tile, 32px value + context line. */
export function KpiCard({
  icon,
  label,
  value,
  context,
  className,
  tone = "brand",
  valueClassName,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  value: React.ReactNode;
  context?: React.ReactNode;
  className?: string;
  /** Icon tile colour (Bookings KPIs use success / brand / danger). */
  tone?: "brand" | "success" | "danger";
  valueClassName?: string;
  /** Makes the card a quick-filter button. */
  onClick?: () => void;
  active?: boolean;
}) {
  const tile =
    tone === "success"
      ? "border-success bg-success-tint text-success"
      : tone === "danger"
        ? "border-brand-text bg-danger-tint text-danger"
        : undefined;
  const body = (
    <>
      <div className="flex items-center gap-2.5">
        <IconTile className={tile}>{icon}</IconTile>
        <p className="min-w-0 flex-1 truncate text-left text-body font-medium text-ink-2">{label}</p>
      </div>
      <div className="flex min-w-0 items-baseline gap-2">
        <p className={cn("text-kpi whitespace-nowrap text-ink", valueClassName)}>{typeof value === "number" || typeof value === "string" ? <CountUp value={value} delay={250} /> : value}</p>
        {context ? <p className="truncate text-label font-medium text-ink-2">{context}</p> : null}
      </div>
    </>
  );
  if (onClick) {
    return (
      <GlassPanel
        level={2}
        role="button"
        tabIndex={0}
        aria-pressed={active}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className={cn(
          "dash-sheen flex cursor-pointer flex-col gap-3.5 p-5 outline-none transition-[filter] hover:brightness-[1.02] focus-visible:ring-2 focus-visible:ring-brand-border",
          active && "ring-2 ring-brand-border",
          className,
        )}
      >
        {body}
      </GlassPanel>
    );
  }
  return <GlassPanel level={2} className={cn("dash-sheen flex flex-col gap-3.5 p-5", className)}>{body}</GlassPanel>;
}

/**
 * Figma: Room card (181:7301) — photo + status chip, title/meta, price,
 * bed availability bar, View / Edit / Delete (40px targets).
 */
export function RoomCard({
  imageSrc,
  imageAlt = "",
  status,
  statusTone = "brand",
  title,
  meta,
  price,
  priceUnit = "/ seat / month",
  bedsLabel,
  occupied,
  total,
  onView,
  onEdit,
  onDelete,
  className,
}: {
  imageSrc?: string;
  imageAlt?: string;
  status?: React.ReactNode;
  statusTone?: StatusChipProps["tone"];
  title: React.ReactNode;
  meta?: React.ReactNode;
  price?: React.ReactNode;
  priceUnit?: React.ReactNode;
  bedsLabel?: React.ReactNode;
  occupied?: number;
  total?: number;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}) {
  return (
    <GlassPanel level={1} className={cn("flex flex-col overflow-hidden rounded-[20px]", className)}>
      <div className="relative h-44 w-full overflow-hidden bg-glass-inset">
        {imageSrc ? (
          <img src={imageSrc} alt={imageAlt} className="absolute inset-0 size-full object-cover" />
        ) : null}
        {status ? (
          <StatusChip tone={statusTone} className="absolute top-3 right-2.5">
            {status}
          </StatusChip>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <p className="text-card-title text-ink">{title}</p>
          {meta ? <p className="text-label text-ink-2">{meta}</p> : null}
        </div>
        {price || bedsLabel ? (
          <div className="flex items-center justify-between whitespace-nowrap">
            <div className="flex items-baseline gap-1">
              {price ? <span className="text-body font-semibold text-ink">{price}</span> : null}
              {price ? (
                <span className="text-label font-medium text-ink-3">{priceUnit}</span>
              ) : null}
            </div>
            {bedsLabel ? (
              <span className="text-label font-medium text-ink-2">{bedsLabel}</span>
            ) : null}
          </div>
        ) : null}
        {typeof occupied === "number" && typeof total === "number" ? (
          <GlassProgress value={occupied} max={total} height={4} aria-label="Beds occupied" />
        ) : null}
        {onView || onEdit || onDelete ? (
          <div className="flex items-center gap-2">
            {onView ? (
              <GlassButton variant="glass" className="flex-1" onClick={onView}>
                <Eye />
                View
              </GlassButton>
            ) : null}
            {onEdit ? (
              <GlassIconButton aria-label="Edit room" onClick={onEdit}>
                <Pencil />
              </GlassIconButton>
            ) : null}
            {onDelete ? (
              <GlassIconButton aria-label="Delete room" variant="danger" onClick={onDelete}>
                <Trash2 />
              </GlassIconButton>
            ) : null}
          </div>
        ) : null}
      </div>
    </GlassPanel>
  );
}
