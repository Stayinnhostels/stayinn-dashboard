import { useEffect, useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Ellipsis, PanelLeft, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  CountBadge,
  GlassIconButton,
  Kbd,
  LogoMark,
  NavGroupLabel,
  NavItem,
  PlanCard,
  SubNav,
  SubNavItem,
} from "@/components/glass";
import { useNavCountsQuery } from "@/queries/admin/useNavCountsQuery";
import type { NavCounts } from "@/api/admin/getNavCounts.api";
import { cn } from "@/lib/utils";
import {
  NAV_GROUPS,
  PRINCIPAL_NAV,
  badgeLabel,
  groupCount,
  groupHasActive,
  isNavItemActive,
  itemCount,
  type AdminNavGroup,
  type AdminNavItem,
} from "./shell/admin-nav";
import { AccountAvatar, AccountMenu, useAccountInfo } from "./shell/admin-account";
import { usePlanQuery } from "@/queries/admin/usePlanQuery";
import type { PlanUsage } from "@/api/admin/getPlan.api";
import { useCommandMenu } from "./shell/admin-command-menu";

/**
 * Figma "Sidebar / Expanded" (264px) and "Sidebar / Collapsed" (76px rail):
 * floating glass-1 panel, 28 radius, 16 padding.
 */

const SIDEBAR_COLLAPSED_KEY = "stay-inn-admin-sidebar-collapsed";
const SIDEBAR_SECTIONS_KEY = "stay-inn-admin-sidebar-sections";

function readCollapsed() {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function readOpenGroups(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(SIDEBAR_SECTIONS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveOpenGroups(value: Record<string, boolean>) {
  try {
    window.localStorage.setItem(SIDEBAR_SECTIONS_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function usePathname() {
  return useRouterState({ select: (s) => s.location.pathname });
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // One panel whose width animates (264 ↔ 76). Both layouts stay mounted on top of
  // each other: the outgoing one fades out first, then the incoming one fades in,
  // so nothing reflows or jumps while the panel resizes.
  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        "glass-1 relative hidden h-full shrink-0 overflow-hidden rounded-[28px] font-geist md:block",
        "transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
        collapsed ? "w-[76px]" : "w-[264px]",
      )}
    >
      <SidebarLayer visible={!collapsed} width={264}>
        <ExpandedSidebar onCollapse={toggle} />
      </SidebarLayer>
      <SidebarLayer visible={collapsed} width={76}>
        <CollapsedRail onExpand={toggle} />
      </SidebarLayer>
    </aside>
  );
}

function SidebarLayer({
  visible,
  width,
  children,
}: {
  visible: boolean;
  width: number;
  children: React.ReactNode;
}) {
  return (
    <div
      inert={!visible}
      aria-hidden={!visible || undefined}
      style={{ width }}
      className={cn(
        "absolute inset-y-0 left-0 transition-opacity motion-reduce:transition-none",
        visible
          ? "opacity-100 delay-150 duration-200 ease-out"
          : "pointer-events-none opacity-0 duration-100 ease-in",
      )}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── Expanded ───────────────────────── */

function ExpandedSidebar({ onCollapse }: { onCollapse: () => void }) {
  const pathname = usePathname();
  const { setOpen: openSearch } = useCommandMenu();
  const { name, title } = useAccountInfo();
  const { data: counts } = useNavCountsQuery();
  const { data: plan } = usePlanQuery();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(readOpenGroups);

  // The group holding the current page opens by itself.
  const activeGroupId = useMemo(
    () => NAV_GROUPS.find((g) => groupHasActive(pathname, g))?.id,
    [pathname],
  );
  useEffect(() => {
    if (!activeGroupId) return;
    setOpenGroups((prev) => {
      if (prev[activeGroupId]) return prev;
      const next = { ...prev, [activeGroupId]: true };
      saveOpenGroups(next);
      return next;
    });
  }, [activeGroupId]);

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveOpenGroups(next);
      return next;
    });

  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <div className="flex items-center justify-between px-1 pb-2">
        <Link
          to="/admin"
          className="flex items-center gap-2.5 rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
        >
          <LogoMark />
          <span className="text-[18px] leading-5 font-semibold text-ink">stayinn</span>
        </Link>
        <GlassIconButton aria-label="Collapse sidebar" size="sm" onClick={onCollapse}>
          <PanelLeft />
        </GlassIconButton>
      </div>

      <button
        type="button"
        data-tour="sidebar-search"
        onClick={() => openSearch(true)}
        className="glass-inset flex h-10 w-full shrink-0 items-center gap-2.5 rounded-[12px] px-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
      >
        <Search aria-hidden className="size-4 shrink-0 text-ink-3" />
        <span className="min-w-0 flex-1 text-body text-ink-3">Search</span>
        <Kbd>⌘K</Kbd>
      </button>

      <nav className="-mx-4 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-4 pb-2 [&>*]:shrink-0">
        <NavGroupLabel>Principal</NavGroupLabel>
        <div data-tour="nav-principal" className="flex flex-col gap-1 [&>*]:shrink-0">
          {PRINCIPAL_NAV.map((item) => (
            <SidebarLink
              key={item.to}
              item={item}
              count={itemCount(item, counts)}
              active={isNavItemActive(pathname, item)}
              tour={item.to === "/admin" ? "nav-dashboard" : undefined}
            />
          ))}
        </div>

        {NAV_GROUPS.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            pathname={pathname}
            counts={counts}
            open={!!openGroups[group.id]}
            onToggle={() => toggleGroup(group.id)}
          />
        ))}
      </nav>

      {plan ? (
        <PlanCard
          className="shrink-0"
          title={plan.plan_name}
          caption={planCaption(plan)}
          used={plan.beds_total ? plan.beds_occupied ?? 0 : plan.rooms_used}
          total={plan.beds_total ? plan.beds_total : plan.room_limit ?? 0}
          showPercent={Boolean(plan.beds_total) || plan.room_limit != null}
        />
      ) : null}

      <AccountMenu side="top" align="start">
        <button
          type="button"
          data-tour="header-account"
          className="flex w-full items-center gap-2.5 rounded-[14px] px-2 pt-2.5 pb-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
        >
          <AccountAvatar />
          <span className="flex min-w-0 flex-1 flex-col whitespace-nowrap">
            <span className="truncate text-body font-semibold text-ink">{name}</span>
            <span className="truncate text-label font-medium text-ink-2">{title}</span>
          </span>
          <Ellipsis aria-hidden className="size-[18px] shrink-0 text-ink-2" />
          <span className="sr-only">Account menu</span>
        </button>
      </AccountMenu>
    </div>
  );
}

function SidebarLink({
  item,
  active,
  count = 0,
  tour,
}: {
  item: AdminNavItem;
  active: boolean;
  count?: number;
  tour?: string;
}) {
  return (
    <NavItem
      asChild
      active={active}
      icon={<item.icon />}
      data-tour={tour}
      badge={count > 0 ? badgeLabel(count) : undefined}
    >
      <Link
        to={item.to as "/admin"}
        aria-label={count > 0 ? `${item.label}, ${count} need attention` : undefined}
      >
        <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
      </Link>
    </NavItem>
  );
}

function SidebarGroup({
  group,
  pathname,
  counts,
  open,
  onToggle,
}: {
  group: AdminNavGroup;
  pathname: string;
  counts?: NavCounts;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `sidebar-group-${group.id}`;
  const hasActive = groupHasActive(pathname, group);
  const total = groupCount(group, counts);
  return (
    <div className="flex flex-col gap-1" data-tour={`nav-section-${group.id}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-2 rounded-[8px] px-3 pt-4 pb-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
      >
        <span
          className={cn(
            "min-w-0 flex-1 text-eyebrow",
            hasActive && !open ? "text-ink" : "text-ink-3",
          )}
        >
          {group.label}
        </span>
        {/* Figma: the group total shows while the group is closed; open groups badge each row. */}
        {total > 0 && !open ? (
          <CountBadge className="min-w-0 px-1.5 py-px" aria-label={`${total} need attention`}>
            {badgeLabel(total)}
          </CountBadge>
        ) : null}
        <ChevronRight
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-ink-2 transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </button>
      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden" inert={!open}>
          {/* Figma sub-nav: 22px indent, 1px left rule, 32px rows, active row on the inset fill. */}
          <SubNav className="[&>div]:gap-0.5">
            {group.items.map((item) => {
              const n = itemCount(item, counts);
              const active = isNavItemActive(pathname, item);
              return (
                <SubNavItem
                  key={item.to}
                  asChild
                  active={active}
                  badge={n > 0 ? badgeLabel(n) : undefined}
                >
                  <Link
                    to={item.to as "/admin"}
                    aria-label={n > 0 ? `${item.label}, ${n} need attention` : undefined}
                  >
                    <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                  </Link>
                </SubNavItem>
              );
            })}
          </SubNav>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Collapsed rail ───────────────────────── */

function RailDivider() {
  return <span aria-hidden className="h-px w-8 shrink-0 bg-glass-divider" />;
}

function RailButton({
  label,
  active,
  tour,
  children,
  asChild,
  onClick,
}: {
  label: string;
  active?: boolean;
  tour?: string;
  children: React.ReactNode;
  asChild?: boolean;
  onClick?: () => void;
}) {
  const cls = cn(
    "relative flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-transparent outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-5",
    active
      ? "border-brand-border bg-brand-tint text-brand-text"
      : "text-ink-2 hover:bg-glass-inset hover:text-ink",
  );
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {asChild ? (
          <span className={cls} data-tour={tour}>
            {children}
          </span>
        ) : (
          <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className={cls}
            data-tour={tour}
          >
            {children}
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={10} className="font-geist">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function RailLink({
  item,
  pathname,
  count = 0,
  tour,
}: {
  item: AdminNavItem;
  pathname: string;
  count?: number;
  tour?: string;
}) {
  const active = isNavItemActive(pathname, item);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={item.to as "/admin"}
          aria-label={item.label}
          aria-current={active ? "page" : undefined}
          data-tour={tour}
          className={cn(
            "relative flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-transparent outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-border",
            active
              ? "border-brand-border bg-brand-tint text-brand-text"
              : "text-ink-2 hover:bg-glass-inset hover:text-ink",
          )}
        >
          <item.icon aria-hidden className="size-5" />
          {count > 0 ? (
            <span
              aria-hidden
              className="absolute top-[7px] left-[27px] size-2 rounded-full bg-danger-solid"
            />
          ) : null}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={10} className="font-geist">
        {item.label}
        {count > 0 ? ` · ${count}` : ""}
      </TooltipContent>
    </Tooltip>
  );
}

function CollapsedRail({ onExpand }: { onExpand: () => void }) {
  const pathname = usePathname();
  const { setOpen: openSearch } = useCommandMenu();
  const { name } = useAccountInfo();
  const { data: counts } = useNavCountsQuery();

  return (
    <div className="flex h-full flex-col items-center gap-1.5 px-3.5 py-4">
      <Link
        to="/admin"
        aria-label="Dashboard"
        className="rounded-[10.8px] outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
      >
        <LogoMark className="size-9 rounded-[10.8px] [&_svg]:size-[19.8px]" />
      </Link>
      <GlassIconButton aria-label="Expand sidebar" className="size-9" onClick={onExpand}>
        <PanelLeft />
      </GlassIconButton>
      <RailDivider />
      <RailButton label="Search (⌘K)" tour="sidebar-search" onClick={() => openSearch(true)}>
        <Search />
      </RailButton>
      <RailDivider />

      <nav className="-mx-3.5 flex min-h-0 w-[calc(100%+28px)] flex-1 flex-col items-center gap-1.5 overflow-y-auto overscroll-contain px-3.5 [&>*]:shrink-0">
        <div data-tour="nav-principal" className="flex flex-col items-center gap-1.5 [&>*]:shrink-0">
          {PRINCIPAL_NAV.map((item) => (
            <RailLink
              key={item.to}
              item={item}
              pathname={pathname}
              count={itemCount(item, counts)}
              tour={item.to === "/admin" ? "nav-dashboard" : undefined}
            />
          ))}
        </div>
        {NAV_GROUPS.map((group) => (
          <div
            key={group.id}
            className="flex flex-col items-center gap-1.5"
            data-tour={`nav-section-${group.id}`}
          >
            <RailDivider />
            {group.items.map((item) => (
              <RailLink
                key={item.to}
                item={item}
                pathname={pathname}
                count={itemCount(item, counts)}
              />
            ))}
          </div>
        ))}
      </nav>

      <AccountMenu side="right" align="end">
        <button
          type="button"
          aria-label={`Account menu — ${name}`}
          data-tour="header-account"
          className="mt-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
        >
          <AccountAvatar size={40} />
        </button>
      </AccountMenu>
    </div>
  );
}

/** "15 rooms · 41 of 42 beds filled" — real room total and bed occupancy (older API: plan limit). */
function planCaption(plan: PlanUsage) {
  if (plan.rooms_total != null && plan.beds_total) {
    const rooms = `${plan.rooms_total} room${plan.rooms_total === 1 ? "" : "s"}`;
    return `${rooms} · ${plan.beds_occupied ?? 0} of ${plan.beds_total} beds filled`;
  }
  if (plan.rooms_total != null) return `${plan.rooms_total} room${plan.rooms_total === 1 ? "" : "s"}`;
  return plan.room_limit ? `${plan.rooms_used} of ${plan.room_limit} rooms used` : `${plan.rooms_used} room${plan.rooms_used === 1 ? "" : "s"}`;
}
