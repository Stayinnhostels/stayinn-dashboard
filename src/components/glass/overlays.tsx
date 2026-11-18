import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconTile } from "./cards";

/** Figma: Notification item (181:7346) — 60px row in the notifications popover. */
export function NotificationItem({
  icon,
  title,
  detail,
  time,
  unread,
  onClick,
  className,
  iconClassName,
}: {
  icon: React.ReactNode;
  /** Overrides the brand-tint tile, e.g. danger tint for urgent items. */
  iconClassName?: string;
  title: React.ReactNode;
  detail?: React.ReactNode;
  time?: React.ReactNode;
  unread?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex min-h-[60px] w-full shrink-0 items-center gap-3 rounded-[14px] px-3 py-2.5 text-left font-geist transition-colors",
        onClick &&
          "cursor-pointer outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border",
        className,
      )}
    >
      <IconTile className={cn("border-transparent", iconClassName)}>{icon}</IconTile>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 font-medium">
        <p className="truncate text-body text-ink">{title}</p>
        {detail ? <p className="truncate text-label text-ink-2">{detail}</p> : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {time ? <span className="text-label font-medium text-ink-3">{time}</span> : null}
        {unread ? (
          <span className="size-2 rounded-full bg-brand">
            <span className="sr-only">Unread</span>
          </span>
        ) : null}
      </div>
    </Comp>
  );
}

/**
 * Figma: Toast (181:7355) — glass-3, 36px solid icon tile, 3px progress bar.
 * Presentational; `progress` (0–100) drives the elapsed bar.
 * Pair with sonner's `toast.custom(() => <GlassToast … />)` when wiring live toasts.
 */
export function GlassToast({
  icon,
  title,
  detail,
  tone = "brand",
  meta,
  progress,
  onDismiss,
  className,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  detail?: React.ReactNode;
  tone?: "brand" | "success";
  /** Right-side text, e.g. "Now". Ignored when onDismiss is set. */
  meta?: React.ReactNode;
  progress?: number;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "glass-3 flex w-[340px] max-w-full flex-col overflow-hidden rounded-[16px] font-geist",
        className,
      )}
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        <IconTile solid>{icon}</IconTile>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-body font-semibold text-ink">{title}</p>
          {detail ? <p className="truncate text-label font-medium text-ink-2">{detail}</p> : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={onDismiss}
            className="rounded-md p-0.5 text-ink-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border"
          >
            <X className="size-4" />
          </button>
        ) : meta ? (
          <span className="shrink-0 text-label font-medium text-brand-text">{meta}</span>
        ) : null}
      </div>
      {typeof progress === "number" ? (
        <div className="h-[3px] w-full bg-glass-inset">
          <div
            className={cn(
              "h-full transition-[width]",
              tone === "success" ? "bg-success" : "bg-brand",
            )}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
