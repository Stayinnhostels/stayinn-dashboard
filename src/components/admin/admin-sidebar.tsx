import { useState } from "react";
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
  Calculator,
  ClipboardList,
  Globe,
  Sparkles,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ADMIN_NAV_LOGO_CLASS, ADMIN_NAV_LOGO_COMPACT_CLASS, TAB_LOGO_SRC } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "stay-inn-admin-sidebar-collapsed";

const frontendBase = (import.meta.env.VITE_PUBLIC_FRONTEND_URL as string | undefined)?.replace(/\/$/, "");

type Item = { to: string; label: string; icon: LucideIcon; exact?: boolean };

const items: Item[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/rooms", label: "Rooms", icon: BedDouble },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
  { to: "/admin/financials", label: "Revenue & Analytics", icon: TrendingUp },
  { to: "/admin/profit-loss", label: "Monthly Reports", icon: Calculator },
  { to: "/admin/monthly-rent", label: "Monthly Rent", icon: ClipboardList },
  { to: "/admin/facilities", label: "Facilities", icon: Sparkles },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/staff", label: "Staff", icon: Shield },
  { to: "/admin/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/website", label: "Website Content", icon: Globe },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

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
      <nav className={cn("min-h-0 flex-1 space-y-1 overflow-y-auto py-4", compact ? "px-2" : "px-3")}>
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          const link = (
            <Link
              key={it.to}
              to={it.to as "/admin"}
              onClick={onNavigate}
              title={compact ? it.label : undefined}
              className={cn(
                "group flex items-center rounded-xl text-sm font-medium transition-all",
                compact ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <it.icon className="h-4 w-4 shrink-0" />
              {!compact ? <span className="truncate">{it.label}</span> : null}
            </Link>
          );

          if (compact) {
            return (
              <Tooltip key={it.to}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {it.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return link;
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
