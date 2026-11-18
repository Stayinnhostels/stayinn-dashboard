import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { CountBadge } from "./chips";

type SlotProps<T> = T & { asChild?: boolean };

/**
 * Figma: Nav item (181:7220) — 40px sidebar row, 20px icon.
 * Active = brand-tint glass pill + 3px indicator.
 * Pass `asChild` to render a router <Link> instead of a button:
 *   <NavItem asChild icon={<Bed />} active><Link to="/admin/rooms">Rooms</Link></NavItem>
 * (in collapsed + asChild mode, wrap the Link text in <span className="sr-only">).
 */
export interface NavItemProps extends SlotProps<React.ButtonHTMLAttributes<HTMLButtonElement>> {
  icon?: React.ReactNode;
  active?: boolean;
  badge?: React.ReactNode;
  /** Icon-only (collapsed sidebar). Label becomes the accessible name. */
  collapsed?: boolean;
}

export const NavItem = React.forwardRef<HTMLButtonElement, NavItemProps>(
  ({ icon, active, badge, collapsed, asChild, className, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex h-10 items-center gap-3 rounded-[12px] border border-transparent font-geist text-body font-medium transition-colors",
          "outline-none focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-5 [&_svg]:shrink-0",
          collapsed ? "w-10 justify-center" : "w-full px-3",
          active
            ? "border-brand-border bg-brand-tint text-ink"
            : "text-ink-2 hover:bg-glass-inset hover:text-ink",
          className,
        )}
        {...props}
      >
        {active && !collapsed ? (
          <span
            aria-hidden
            className="absolute top-2.5 -left-px h-[18px] w-[3px] rounded-[2px] bg-brand"
          />
        ) : null}
        {icon}
        {asChild ? (
          <Slottable>{children}</Slottable>
        ) : collapsed ? (
          <span className="sr-only">{children}</span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-left">{children}</span>
        )}
        {badge != null && !collapsed ? <CountBadge className="ml-auto">{badge}</CountBadge> : null}
        {badge != null && collapsed ? (
          <span
            aria-hidden
            className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger-solid"
          />
        ) : null}
      </Comp>
    );
  },
);
NavItem.displayName = "NavItem";

/** Indented sub-navigation list with a left divider rule (Dashboard → Overview / Weekly …). */
export function SubNav({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("py-1 pl-[22px]", className)}>
      <div className="flex flex-col border-l border-glass-divider pl-3.5" {...props} />
    </div>
  );
}

export const SubNavItem = React.forwardRef<
  HTMLButtonElement,
  SlotProps<React.ButtonHTMLAttributes<HTMLButtonElement>> & {
    active?: boolean;
    badge?: React.ReactNode;
  }
>(({ active, badge, asChild, className, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-[8px] px-2 font-geist text-body transition-colors",
        "outline-none focus-visible:ring-2 focus-visible:ring-brand-border",
        active ? "bg-glass-inset font-medium text-ink" : "text-ink-2 hover:text-ink",
        className,
      )}
      {...props}
    >
      {asChild ? (
        <Slottable>{children}</Slottable>
      ) : (
        <span className="min-w-0 flex-1 truncate text-left">{children}</span>
      )}
      {badge != null ? <CountBadge className="ml-auto px-1.5 py-px">{badge}</CountBadge> : null}
    </Comp>
  );
});
SubNavItem.displayName = "SubNavItem";

/** Eyebrow group label ("PRINCIPAL", "OPERATIONS"). */
export function NavGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("px-3 pt-4 pb-1.5 font-geist text-eyebrow text-ink-3", className)}
      {...props}
    />
  );
}

/**
 * Figma: Tab item (181:7232) — mobile bottom tab, 60px wide, icon over label.
 * Active = brand-tint pill with brand text.
 */
export const TabItem = React.forwardRef<
  HTMLButtonElement,
  SlotProps<React.ButtonHTMLAttributes<HTMLButtonElement>> & {
    icon: React.ReactNode;
    active?: boolean;
  }
>(({ icon, active, asChild, className, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-[60px] flex-col items-center justify-center gap-0.5 rounded-[14px] border border-transparent py-[3px] font-geist text-label font-medium",
        "outline-none focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-5",
        active ? "border-brand-border bg-brand-tint text-brand-text" : "text-ink-2",
        className,
      )}
      {...props}
    >
      {icon}
      <Slottable>{children}</Slottable>
    </Comp>
  );
});
TabItem.displayName = "TabItem";
