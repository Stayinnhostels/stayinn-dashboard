import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "@tanstack/react-router";
import { BedDouble, CalendarPlus, CircleHelp, Plus, UserPlus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { glassMenuClass } from "./shell/admin-account";
import { GlassButton, GlassIconButton, LogoMark } from "@/components/glass";
import { useOnboardingTourStore } from "@/stores/tour/onboarding-tour.store";
import { LiveNotificationAlerts } from "./live-notification-alerts";
import { NotificationsBell } from "./notifications-bell";
import { HostelSwitcher } from "./hostel-switcher";

/**
 * Figma "Top bar" (desktop, 72px, inside the glass shell) and "Mobile / Top bar" (48px).
 * The page title lives in the content area (see admin layout), as in the design.
 * The account lives in the sidebar footer (Figma: "Account shows the same user as the sidebar").
 */
export function AdminHeader() {
  const bellAnchorRef = useRef<HTMLDivElement>(null);
  const startTour = useOnboardingTourStore((s) => s.start);
  // Render one bar only, so the tour's data-tour targets are never duplicated.
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <header className="relative z-30 flex h-12 shrink-0 items-center gap-2 font-geist">
        <Link
          to="/admin"
          className="flex items-center gap-2 rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
        >
          <LogoMark />
          <span className="text-[18px] leading-5 font-semibold text-ink">stayinn</span>
        </Link>
        <div className="min-w-0 flex-1" />
        <HostelSwitcher compact />
        <div
          ref={bellAnchorRef}
          className="relative flex items-center"
          data-tour="header-notifications"
        >
          <LiveNotificationAlerts anchorRef={bellAnchorRef} />
          <NotificationsBell />
        </div>
        <MobileNewMenu />
      </header>
    );
  }

  return (
    <header className="relative z-30 flex h-[72px] shrink-0 items-center gap-2.5 border-b border-glass-divider px-6 font-geist">
      <HostelSwitcher />
      <div className="min-w-0 flex-1" />
      <GlassIconButton
        aria-label="Show dashboard tour"
        data-tour="header-help"
        onClick={() => startTour()}
      >
        <CircleHelp />
      </GlassIconButton>
      <div
        ref={bellAnchorRef}
        className="relative flex items-center"
        data-tour="header-notifications"
      >
        <LiveNotificationAlerts anchorRef={bellAnchorRef} />
        <NotificationsBell />
      </div>
    </header>
  );
}

/** Figma "Mobile / Top bar": primary "New" — add a booking, a resident or a room. */
function MobileNewMenu() {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <GlassButton data-tour="mobile-new" className="px-4">
          <Plus aria-hidden /> New
        </GlassButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className={glassMenuClass + " w-52"}>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate({ to: "/admin/bookings", search: { walkin: true } })}
        >
          <CalendarPlus /> New booking
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate({ to: "/admin/bookings", search: { walkin: true } })}
        >
          <UserPlus /> New resident
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate({ to: "/admin/rooms", search: { new: true } })}
        >
          <BedDouble /> New room
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
