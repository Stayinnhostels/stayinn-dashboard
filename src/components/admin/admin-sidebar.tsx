import { useEffect, useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  Wallet,
  ArrowLeft,
  Star,
  Bell,
  Wrench,
  TicketPercent,
  Shield,
  Settings,
  TrendingUp,
  ClipboardList,
  Globe,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Receipt,
  ChevronDown,
  ContactRound,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ADMIN_NAV_LOGO_CLASS, ADMIN_NAV_LOGO_COMPACT_CLASS, TAB_LOGO_SRC } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "stay-inn-admin-sidebar-collapsed";
const SIDEBAR_SECTIONS_KEY = "stay-inn-admin-sidebar-sections";

const frontendBase = (import.meta.env.VITE_PUBLIC_FRONTEND_URL as string | undefined)?.replace(/\/$/, "");

type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean };

type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

const overviewItem: NavItem = {
  to: "/admin",
  label: "Dashboard",
  icon: LayoutDashboard,
  exact: true,
};

const navSections: NavSection[] = [
  {
    id: "operations",
    label: "Operations",
    items: [
      { to: "/admin/rooms", label: "Rooms", icon: BedDouble },
      { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
      { to: "/admin/booking-requests", label: "Guest Requests", icon: ClipboardList },
      { to: "/admin/residents", label: "Residents", icon: ContactRound, exact: true },
      { to: "/admin/residents-by-room", label: "Residents by Room", icon: Building2 },
      { to: "/admin/monthly-rent", label: "Monthly Rent", icon: ClipboardList },
      { to: "/admin/maintenance", label: "Maintenance", icon: Wrench },
      { to: "/admin/facilities", label: "Facilities", icon: Sparkles },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/staff", label: "Staff", icon: Shield },
      { to: "/admin/messages", label: "Messages", icon: MessageSquare },
      { to: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { to: "/admin/payments", label: "Payments", icon: Wallet },
      { to: "/admin/security-payments", label: "Security", icon: ShieldCheck },
      { to: "/admin/financials", label: "Revenue & Analytics", icon: TrendingUp },
      { to: "/admin/expenses", label: "Monthly Expenses", icon: Receipt },
      { to: "/admin/coupons", label: "Coupons", icon: TicketPercent },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { to: "/admin/notifications", label: "Notifications", icon: Bell },
      { to: "/admin/website", label: "Website Content", icon: Globe },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function isItemActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.to : pathname.startsWith(item.to);
}

function sectionHasActive(pathname: string, section: NavSection) {
  return section.items.some((item) => isItemActive(pathname, item));
}

function readCollapsedPreference() {
  try {
    if (typeof window !== "undefined" && window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1") {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

function readOpenSections(): Record<string, boolean> {
  try {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(SIDEBAR_SECTIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function NavLink({
  item,
  active,
  compact,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  compact: boolean;
  onNavigate?: () => void;
}) {
  const link = (
    <Link
      to={item.to as "/admin"}
      onClick={onNavigate}
      title={compact ? item.label : undefined}
      className={cn(
        "group flex items-center rounded-xl text-sm font-medium transition-all",
        compact ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2",
        active
          ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!compact ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );

  if (!compact) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarBody({
  onNavigate,
  collapsed = false,
  showCollapseToggle = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  showCollapseToggle?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const compact = showCollapseToggle && collapsed;
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(readOpenSections);

  const activeSectionIds = useMemo(
    () => navSections.filter((s) => sectionHasActive(pathname, s)).map((s) => s.id),
    [pathname],
  );

  useEffect(() => {
    if (activeSectionIds.length === 0) return;
    setOpenSections((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const id of activeSectionIds) {
        if (next[id] !== true) {
          next[id] = true;
          changed = true;
        }
      }
      if (!changed) return prev;
      try {
        window.localStorage.setItem(SIDEBAR_SECTIONS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [activeSectionIds]);

  function isSectionOpen(section: NavSection) {
    if (openSections[section.id] != null) return openSections[section.id];
    // First visit (no saved prefs): keep groups expanded so nav stays discoverable.
    return true;
  }

  function toggleSection(sectionId: string) {
    setOpenSections((prev) => {
      const currentlyOpen = prev[sectionId] ?? true;
      const next = { ...prev, [sectionId]: !currentlyOpen };
      try {
        window.localStorage.setItem(SIDEBAR_SECTIONS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <>
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-border/60",
          compact ? "flex-col gap-2 px-2 py-3" : "min-h-20 justify-between gap-3 px-4 py-3",
        )}
      >
        <div className={cn("flex items-center gap-3", compact && "flex-col")}>
          <img
            src={TAB_LOGO_SRC}
            alt="Stay Inn"
            className={cn("shrink-0", compact ? ADMIN_NAV_LOGO_COMPACT_CLASS : ADMIN_NAV_LOGO_CLASS)}
          />
          {!compact ? (
            <div className="min-w-0 leading-tight">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Admin Console
              </p>
            </div>
          ) : null}
        </div>
        {showCollapseToggle ? (
          <SidebarTrigger className={cn("shrink-0", compact && "h-8 w-8")} />
        ) : null}
      </div>

      <nav className={cn("min-h-0 flex-1 space-y-4 overflow-y-auto py-4", compact ? "px-2" : "px-3")}>
        <div className="space-y-1" data-tour="nav-dashboard">
          <NavLink
            item={overviewItem}
            active={isItemActive(pathname, overviewItem)}
            compact={compact}
            onNavigate={onNavigate}
          />
        </div>

        {navSections.map((section) => {
          const open = compact ? true : isSectionOpen(section);
          const sectionActive = sectionHasActive(pathname, section);

          return (
            <div key={section.id} className="space-y-1" data-tour={`nav-section-${section.id}`}>
              {!compact ? (
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={open}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
                    sectionActive
                      ? "text-foreground"
                      : "text-muted-foreground/80 hover:text-foreground",
                  )}
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-in-out",
                      open ? "rotate-0" : "-rotate-90",
                    )}
                  />
                </button>
              ) : (
                <div className="mx-auto h-px w-6 bg-border/70" aria-hidden />
              )}

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-in-out",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className={cn(
                      "space-y-1 transition-opacity duration-300 ease-in-out",
                      open ? "opacity-100" : "opacity-0",
                      !compact && "pt-0.5",
                    )}
                  >
                    {section.items.map((item) => (
                      <NavLink
                        key={item.to}
                        item={item}
                        active={isItemActive(pathname, item)}
                        compact={compact}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className={cn("shrink-0 space-y-1 border-t border-border/60 p-3", compact && "px-2")}>
        {compact ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/dashboard"
                  onClick={onNavigate}
                  title="Account dashboard"
                  className="flex items-center justify-center rounded-xl px-0 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Account dashboard
              </TooltipContent>
            </Tooltip>
            {frontendBase ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={frontendBase}
                    onClick={onNavigate}
                    rel="noopener noreferrer"
                    title="Public website"
                    className="flex items-center justify-center rounded-xl px-0 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  Public website
                </TooltipContent>
              </Tooltip>
            ) : null}
          </>
        ) : (
          <>
            <Link
              to="/dashboard"
              onClick={onNavigate}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Account dashboard
            </Link>
            {frontendBase ? (
              <a
                href={frontendBase}
                onClick={onNavigate}
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Globe className="h-3.5 w-3.5" /> Public website
              </a>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(readCollapsedPreference);

  function handleOpenChange(open: boolean) {
    const nextCollapsed = !open;
    setCollapsed(nextCollapsed);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, nextCollapsed ? "1" : "0");
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <SidebarProvider
      open={!collapsed}
      onOpenChange={handleOpenChange}
      className="hidden h-full min-h-0 w-auto shrink-0 md:block"
    >
      <aside
        className={cn(
          "flex h-full min-h-0 flex-col overflow-hidden border-r border-border/60 bg-card/40 backdrop-blur-xl transition-[width] duration-200 ease-out",
          collapsed ? "w-[4.5rem]" : "w-64 lg:w-72",
        )}
      >
        <SidebarBody collapsed={collapsed} showCollapseToggle />
      </aside>
    </SidebarProvider>
  );
}

export function AdminMobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-72 flex-col p-0">
        <SidebarBody onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
