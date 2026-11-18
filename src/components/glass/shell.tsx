import * as React from "react";
import { Building2, ChevronDown, Ellipsis, House } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassProgress } from "./cards";
import { RoleTag } from "./chips";

/**
 * Shell building blocks from Figma "Shell components" (181:7376):
 * Sidebar / Expanded (264px), Sidebar / Collapsed (76px), Top bar (72px),
 * Mobile / Top bar, Mobile / Tab bar.
 * These are layout-only; routing and data stay in the existing admin components.
 */

/** Floating glass-1 sidebar container. */
export function GlassSidebar({
  collapsed,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { collapsed?: boolean }) {
  return (
    <aside
      className={cn(
        "glass-1 flex h-full flex-col gap-1 rounded-[28px] p-4 font-geist text-ink",
        collapsed ? "w-[76px] items-center" : "w-[264px]",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

/** 32px brand logo mark (rounded square, house icon, glow). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[9.6px] bg-brand text-on-brand shadow-logo",
        className,
      )}
    >
      <House className="size-[17.6px]" />
    </span>
  );
}

/** Logo mark + "stayinn" wordmark. */
export function Logo({ className, label = "stayinn" }: { className?: string; label?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[18px] leading-5 font-semibold text-ink">{label}</span>
    </span>
  );
}

/** Initials avatar — brand tint with a soft white ring. */
export function GlassAvatar({
  initials,
  src,
  size = 36,
  className,
}: {
  initials: string;
  src?: string;
  size?: 32 | 36;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-white/35 bg-brand-tint font-geist text-label font-medium text-brand-text",
        size === 32 ? "size-8" : "size-9",
        className,
      )}
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : initials}
    </span>
  );
}

/** Sidebar footer plan / usage card. */
export function PlanCard({
  title,
  caption,
  used,
  total,
  showPercent = true,
  className,
}: {
  title: React.ReactNode;
  caption?: React.ReactNode;
  used: number;
  total: number;
  /** Hide the % and bar when there is no limit. */
  showPercent?: boolean;
  className?: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div className={cn("glass-2 flex w-full flex-col gap-2 rounded-[16px] p-3.5", className)}>
      <div className="flex items-center justify-between whitespace-nowrap">
        <p className="text-body font-semibold text-ink">{title}</p>
        {showPercent ? <p className="text-label font-medium text-brand-text">{pct}%</p> : null}
      </div>
      {caption ? <p className="text-label font-medium text-ink-2">{caption}</p> : null}
      {showPercent ? <GlassProgress value={Math.min(used, total)} max={total} height={6} aria-label="Usage" /> : null}
    </div>
  );
}

/** Sidebar footer user row (avatar, name, role, overflow menu trigger). */
export function SidebarUser({
  initials,
  name,
  role,
  onMenu,
  className,
}: {
  initials: string;
  name: React.ReactNode;
  role?: React.ReactNode;
  onMenu?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full items-center gap-2.5 px-2 pt-2.5 pb-0.5", className)}>
      <GlassAvatar initials={initials} />
      <div className="flex min-w-0 flex-1 flex-col whitespace-nowrap">
        <p className="truncate text-body font-semibold text-ink">{name}</p>
        {role ? <p className="truncate text-label font-medium text-ink-2">{role}</p> : null}
      </div>
      {onMenu ? (
        <button
          type="button"
          aria-label="Account menu"
          onClick={onMenu}
          className="rounded-md p-0.5 text-ink-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border"
        >
          <Ellipsis className="size-[18px]" />
        </button>
      ) : null}
    </div>
  );
}

/** Top bar row (72px, divider below). Put PropertySwitcher left, actions right. */
export function GlassTopBar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        "flex h-[72px] items-center gap-2.5 border-b border-glass-divider px-6 font-geist",
        className,
      )}
      {...props}
    />
  );
}

/** Glass-2 property switcher trigger ("Stay Inn Hostels ⌄"). */
export const PropertySwitcher = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: React.ReactNode }
>(({ label, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "glass-2 flex h-10 items-center gap-2 rounded-[12px] px-3 font-geist text-body font-medium whitespace-nowrap text-ink",
      "outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border",
      className,
    )}
    {...props}
  >
    <Building2 aria-hidden className="size-4 shrink-0 text-ink-2" />
    <span className="truncate">{label}</span>
    <ChevronDown aria-hidden className="size-4 shrink-0 text-ink-2" />
  </button>
));
PropertySwitcher.displayName = "PropertySwitcher";

/** Glass-2 account pill (avatar, name + role tag, email, chevron). */
export const AccountChip = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    initials: string;
    name: React.ReactNode;
    role?: React.ReactNode;
    email?: React.ReactNode;
  }
>(({ initials, name, role, email, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "glass-2 flex items-center gap-2.5 rounded-full py-1 pr-2.5 pl-1 text-left font-geist",
      "outline-none hover:bg-glass-inset focus-visible:ring-2 focus-visible:ring-brand-border",
      className,
    )}
    {...props}
  >
    <GlassAvatar initials={initials} size={32} />
    <span className="flex min-w-0 flex-col">
      <span className="flex items-center gap-1.5">
        <span className="truncate text-body font-semibold text-ink">{name}</span>
        {role ? <RoleTag>{role}</RoleTag> : null}
      </span>
      {email ? <span className="truncate text-label font-medium text-ink-3">{email}</span> : null}
    </span>
    <ChevronDown aria-hidden className="size-4 shrink-0 text-ink-2" />
  </button>
));
AccountChip.displayName = "AccountChip";

/** Thin vertical divider used between top-bar actions. */
export function VDivider({ className }: { className?: string }) {
  return <span aria-hidden className={cn("h-6 w-px shrink-0 bg-glass-divider", className)} />;
}

/**
 * Floating glass-3 bottom tab bar (64px, 24px radius). Fill with <TabItem>s.
 * Figma: sits 12px from the bottom, safe-area aware — position it with e.g.
 * `fixed inset-x-6 bottom-[calc(12px+env(safe-area-inset-bottom))]`.
 */
export function MobileTabBar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn(
        "glass-3 flex h-16 items-center justify-between rounded-[24px] px-2",
        className,
      )}
      {...props}
    />
  );
}
