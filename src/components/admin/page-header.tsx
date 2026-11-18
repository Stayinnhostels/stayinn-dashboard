import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Figma "Page header": 28/34 title + 14/20 subtitle on the left, actions bottom-aligned on the right.
 * The admin layout renders it from the route title; pages with their own subtitle or
 * buttons render it themselves (see CUSTOM_HEADER_ROUTES in routes/admin.tsx).
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-4 pt-2 sm:flex-row sm:items-end sm:justify-between md:mb-5 md:pt-0",
        className,
      )}
    >
      <div className="flex min-h-[58px] min-w-0 flex-col justify-center gap-1">
        <h1 className="truncate text-page-title text-ink">{title}</h1>
        {subtitle ? <p className="truncate text-body text-ink-2">{subtitle}</p> : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>
      ) : null}
    </div>
  );
}
