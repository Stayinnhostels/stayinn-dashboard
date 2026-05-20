import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LiveNotificationAlerts } from "./live-notification-alerts";
import { NotificationsBell } from "./notifications-bell";

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

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 md:px-8 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg md:text-xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div ref={bellAnchorRef} className="relative flex items-center">
          <LiveNotificationAlerts anchorRef={bellAnchorRef} />
          <NotificationsBell />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full font-semibold">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.fullName ?? "Admin"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-bold">{user?.email}</DropdownMenuLabel>
            <DropdownMenuLabel className="-mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              {user?.role}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
