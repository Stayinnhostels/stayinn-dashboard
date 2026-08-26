import { useMemo, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, CircleHelp, LogOut, Menu, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth-context";
import { useOnboardingTourStore } from "@/stores/tour/onboarding-tour.store";
import { LiveNotificationAlerts } from "./live-notification-alerts";
import { NotificationsBell } from "./notifications-bell";
import type { AuthUser } from "@/types/domain/auth.types";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function roleLabel(role: AuthUser["role"] | undefined) {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  return role ?? "Admin";
}

function profilePhotoUrl(user: AuthUser | null | undefined) {
  if (!user) return undefined;
  if (user.avatarUrl?.trim()) return user.avatarUrl.trim();
  const name = encodeURIComponent(user.fullName || user.email || "Admin");
  return `https://ui-avatars.com/api/?name=${name}&background=E8EEF4&color=3D5A73&bold=true&size=128&format=png`;
}

export function AdminHeader({
  title,
  subtitle,
  onOpenMobileNav,
}: {
  title: string;
  subtitle?: string;
  onOpenMobileNav?: () => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const bellAnchorRef = useRef<HTMLDivElement>(null);
  const startTour = useOnboardingTourStore((s) => s.start);

  const displayName = user?.fullName ?? "Admin";
  const initials = useMemo(() => initialsFromName(displayName), [displayName]);
  const photoUrl = useMemo(() => profilePhotoUrl(user), [user]);

  async function handleLogout() {
    await logout();
    navigate({ to: "/login" });
  }

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between gap-4 overflow-visible border-b border-border/50 bg-background px-4 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open menu"
          data-tour="mobile-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight md:text-xl">{title}</h1>
          {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 overflow-visible">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 overflow-visible rounded-full border-none bg-linear-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/30 transition-transform hover:scale-105 hover:shadow-lg hover:shadow-primary/40"
                aria-label="Show dashboard tour"
                data-tour="header-help"
                onClick={() => startTour()}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-[3px] rounded-full border-2 border-primary animate-help-ring"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-[3px] rounded-full border-2 border-primary/60 animate-help-ring [animation-delay:0.9s]"
                />
                <CircleHelp className="relative z-10 h-4.75 w-4.75 stroke-2" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Show tour</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div ref={bellAnchorRef} className="relative flex items-center" data-tour="header-notifications">
          <LiveNotificationAlerts anchorRef={bellAnchorRef} />
          <NotificationsBell />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto gap-2.5 rounded-full px-1.5 py-1 hover:bg-muted/60 data-[state=open]:bg-muted/60"
              aria-label="Open account menu"
              data-tour="header-account"
            >
              <Avatar className="h-9 w-9">
                {photoUrl ? <AvatarImage src={photoUrl} alt={displayName} className="object-cover" /> : null}
                <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block truncate text-sm font-semibold leading-tight text-foreground">
                  {displayName}
                </span>
                <span className="block truncate text-xs font-normal leading-tight text-muted-foreground">
                  {user?.email ?? ""}
                </span>
              </span>
              <ChevronDown className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-60 rounded-xl border-border/60 p-0 shadow-lg" align="end" forceMount>
            <div className="flex flex-col items-center gap-2 px-4 pb-3.5 pt-4">
              <Avatar className="h-12 w-12">
                {photoUrl ? <AvatarImage src={photoUrl} alt={displayName} className="object-cover" /> : null}
                <AvatarFallback className="bg-muted text-sm font-semibold text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <DropdownMenuLabel className="space-y-1 p-0 text-center font-normal">
                <p className="text-sm font-semibold leading-none">{displayName}</p>
                <p className="text-[11px] text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <Badge
                variant="secondary"
                className="gap-1 rounded-full border-0 bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                <Shield className="h-3 w-3" />
                {roleLabel(user?.role)}
              </Badge>
            </div>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-1.5">
              <DropdownMenuItem
                className="cursor-pointer rounded-lg py-2 text-sm"
                onClick={() => navigate({ to: "/admin/settings" })}
              >
                Edit profile photo
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer justify-center gap-2 rounded-lg py-2 text-sm text-muted-foreground focus:bg-muted focus:text-foreground"
                onClick={() => void handleLogout()}
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
