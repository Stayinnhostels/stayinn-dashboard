import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Drawer } from "vaul";
import { ChevronRight, CircleHelp, Ellipsis, LogOut, Search } from "lucide-react";
import { MobileTabBar, TabItem } from "@/components/glass";
import { useAuth } from "@/lib/auth-context";
import { ThemeSwitcher } from "@/components/glass/theme-switcher";
import { cn } from "@/lib/utils";
import { useOnboardingTourStore } from "@/stores/tour/onboarding-tour.store";
import {
  HOME_TAB_ICON,
  NAV_GROUPS,
  PRINCIPAL_NAV,
  badgeLabel,
  isNavItemActive,
  itemCount,
  type AdminNavItem,
} from "./admin-nav";
import { CountBadge } from "@/components/glass";
import { useNavCountsQuery } from "@/queries/admin/useNavCountsQuery";
import { AccountAvatar, useAccountInfo } from "./admin-account";
import { useCommandMenu } from "./admin-command-menu";

/**
 * Figma "Mobile / Tab bar" (floating glass-3, 12px from the bottom, safe-area aware)
 * and "Bottom sheet / More" (every page outside the four tabs, plus account).
 */
export function AdminMobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [moreOpen, setMoreOpen] = useState(false);
  const onPrincipalPage = PRINCIPAL_NAV.some((item) => isNavItemActive(pathname, item));

  return (
    <>
      <MobileTabBar
        aria-label="Main navigation"
        data-tour="mobile-tabbar"
        className="fixed inset-x-6 bottom-[calc(12px+env(safe-area-inset-bottom))] z-40 md:hidden"
      >
        {PRINCIPAL_NAV.map((item) => {
          const Icon = item.to === "/admin" ? HOME_TAB_ICON : item.icon;
          return (
            <TabItem key={item.to} asChild icon={<Icon />} active={isNavItemActive(pathname, item)}>
              <Link to={item.to as "/admin"}>{item.tabLabel ?? item.label}</Link>
            </TabItem>
          );
        })}
        <TabItem
          icon={<Ellipsis />}
          active={moreOpen || !onPrincipalPage}
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          data-tour="mobile-menu"
        >
          More
        </TabItem>
      </MobileTabBar>
      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} pathname={pathname} />
    </>
  );
}

function MoreSheet({
  open,
  onOpenChange,
  pathname,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { name, title } = useAccountInfo();
  const { setOpen: openSearch } = useCommandMenu();
  const startTour = useOnboardingTourStore((s) => s.start);
  const { data: counts } = useNavCountsQuery();
  const close = () => onOpenChange(false);

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-scrim" />
        <Drawer.Content
          aria-describedby={undefined}
          className="glass-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[88svh] flex-col rounded-t-[28px] font-geist text-ink outline-none"
        >
          <div className="flex flex-col items-center px-4 pt-2.5">
            <span aria-hidden className="h-[5px] w-10 rounded-[3px] bg-ink-3" />
            <div className="flex w-full items-center justify-between py-1 pt-4">
              <Drawer.Title className="text-hero text-ink">More</Drawer.Title>
              <Drawer.Close className="rounded-sm text-body font-medium text-brand-text outline-none focus-visible:ring-2 focus-visible:ring-brand-border">
                Close
              </Drawer.Close>
            </div>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto px-4 pt-3 pb-[calc(32px+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => {
                close();
                openSearch(true);
              }}
              className="glass-2 flex h-11 w-full items-center gap-2.5 rounded-[14px] px-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
            >
              <Search aria-hidden className="size-4 shrink-0 text-ink-3" />
              <span className="text-body text-ink-3">Search</span>
            </button>

            {NAV_GROUPS.map((group) => (
              <section key={group.id} className="flex flex-col gap-3" aria-label={group.label}>
                <h3 className="px-1 pt-1.5 text-eyebrow text-ink-3">{group.label}</h3>
                {group.items.map((item) => (
                  <SheetRow
                    key={item.to}
                    item={item}
                    count={itemCount(item, counts)}
                    active={isNavItemActive(pathname, item)}
                    onNavigate={close}
                  />
                ))}
              </section>
            ))}

            <h3 className="px-1 pt-1.5 text-eyebrow text-ink-3">Account</h3>
            <button
              type="button"
              onClick={() => {
                close();
                navigate({ to: "/admin/settings" });
              }}
              className="glass-inset flex h-[60px] w-full items-center gap-3 rounded-[16px] px-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
              data-tour="header-account"
            >
              <AccountAvatar />
              <span className="flex min-w-0 flex-1 flex-col whitespace-nowrap">
                <span className="truncate text-body font-semibold text-ink">{name}</span>
                <span className="truncate text-label font-medium text-ink-2">{title}</span>
              </span>
              <ChevronRight aria-hidden className="size-[18px] shrink-0 text-ink-2" />
            </button>
            <ThemeSwitcher wide className="mt-1" />
            <SheetAction
              icon={<CircleHelp />}
              label="Show the tour"
              onClick={() => {
                close();
                // Let the sheet finish closing so the tour can measure the page.
                window.setTimeout(() => startTour(), 350);
              }}
            />
            <SheetAction
              icon={<LogOut />}
              label="Sign out"
              onClick={async () => {
                close();
                await logout();
                navigate({ to: "/login" });
              }}
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const rowClass =
  "flex h-[52px] w-full items-center gap-3 rounded-[16px] border px-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-border";

function SheetRow({
  item,
  active,
  count = 0,
  onNavigate,
}: {
  item: AdminNavItem;
  active: boolean;
  count?: number;
  onNavigate: () => void;
}) {
  return (
    <Link
      to={item.to as "/admin"}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        rowClass,
        active ? "border-brand-border bg-brand-tint" : "border-glass-divider bg-glass-inset",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint text-brand-text">
        <item.icon aria-hidden className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate text-body font-medium text-ink">{item.label}</span>
      {count > 0 ? <CountBadge>{badgeLabel(count)}</CountBadge> : null}
      <ChevronRight aria-hidden className="size-[18px] shrink-0 text-ink-2" />
    </Link>
  );
}

function SheetAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(rowClass, "border-glass-divider bg-glass-inset")}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-glass-inset text-ink-2 [&_svg]:size-4">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-body font-medium text-ink">{label}</span>
    </button>
  );
}
