import { useEffect, useState } from "react";
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
  ChevronsLeft,
  ChevronsRight,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "stay-inn-admin-sidebar-collapsed";

const frontendBase = (import.meta.env.VITE_PUBLIC_FRONTEND_URL as string | undefined)?.replace(/\/$/, "");

type Item = { to: string; label: string; icon: LucideIcon; exact?: boolean };

const items: Item[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/rooms", label: "Rooms", icon: BedDouble },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
  { to: "/admin/financials", label: "Revenue & Analytics", icon: TrendingUp },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/staff", label: "Staff", icon: Shield },
  { to: "/admin/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function SidebarBody({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isRail = Boolean(onToggleCollapse);
  const compact = isRail && collapsed;

  return (
    <>
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-border/60",
          compact ? "flex-col gap-2 px-2 py-3" : "h-16 justify-between gap-2 px-4",
        )}
      >
        <div className={cn("flex items-center gap-2", compact && "flex-col")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] font-black text-primary-foreground">
            S
          </div>
          {!compact ? (
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-extrabold tracking-tight">Stay Inn</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Admin Console
              </p>
            </div>
          ) : null}
        </div>
        {onToggleCollapse ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("shrink-0", compact && "h-8 w-8")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={onToggleCollapse}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </Button>
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

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1") {
        setCollapsed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
      }
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "hidden h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-border/60 bg-card/40 backdrop-blur-xl transition-[width] duration-200 ease-out md:flex",
        collapsed ? "md:w-[4.5rem]" : "md:w-64 lg:w-72",
      )}
    >
      <TooltipProvider delayDuration={0}>
        <SidebarBody collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
      </TooltipProvider>
    </aside>
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
