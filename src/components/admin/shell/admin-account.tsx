import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { ThemeSwitcher } from "@/components/glass/theme-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { SUPPORT_EMAIL } from "@/lib/brand-assets";
import { useOnboardingTourStore } from "@/stores/tour/onboarding-tour.store";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/domain/auth.types";

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function roleLabel(role: AuthUser["role"] | undefined) {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  return role ?? "Admin";
}

/** Signed-in user's display info, shared by the sidebar, top bar and mobile sheet. */
export function useAccountInfo() {
  const { user } = useAuth();
  const name = user?.fullName ?? "Admin";
  return {
    name,
    email: user?.email ?? "",
    role: roleLabel(user?.role),
    /** Job title when set (e.g. "Hostel manager"), otherwise the role label. */
    title: user?.jobTitle?.trim() || roleLabel(user?.role),
    initials: initialsFromName(name),
    avatarUrl: user?.avatarUrl?.trim() || undefined,
  };
}

/** Initials avatar (brand tint + soft white ring); shows the profile photo when there is one. */
export function AccountAvatar({
  size = 36,
  className,
}: {
  size?: 32 | 36 | 40;
  className?: string;
}) {
  const { initials, avatarUrl } = useAccountInfo();
  const [broken, setBroken] = React.useState(false);
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-white/35 bg-brand-tint font-geist text-label font-medium text-brand-text",
        size === 32 ? "size-8" : size === 40 ? "size-10" : "size-9",
        className,
      )}
    >
      {avatarUrl && !broken ? (
        <img
          src={avatarUrl}
          alt=""
          className="size-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}

export const glassMenuClass =
  "glass-3 rounded-[16px] border-glass-stroke p-1.5 font-geist text-ink shadow-none [&_[role^=menuitem]]:rounded-[10px] [&_[role^=menuitem]]:px-2.5 [&_[role^=menuitem]]:py-2 [&_[role^=menuitem]]:text-body [&_[role^=menuitem]]:text-ink [&_[role^=menuitem]:focus]:bg-glass-inset [&_[role^=menuitem]>svg]:size-4 [&_[role^=menuitem]>svg]:text-ink-2";

const ITEM =
  "cursor-pointer rounded-none px-3.5 py-[11px] text-body font-medium text-ink outline-none focus:bg-glass-inset data-[highlighted]:bg-glass-inset";

/**
 * Figma 20.08 "Account menu": profile, Theme (Light / Dark / System), Account settings,
 * Take the dashboard tour, Help & support, Sign out.
 */
export function AccountMenu({
  children,
  align = "end",
  side,
}: {
  children: React.ReactNode;
  align?: "start" | "end";
  side?: "top" | "bottom" | "right";
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const startTour = useOnboardingTourStore((s) => s.start);
  const { name, role, title } = useAccountInfo();
  const subtitle = title !== role ? `${title} · ${role}` : role;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={8}
        className="glass-3 w-[262px] overflow-hidden rounded-[20px] border-glass-stroke p-0 font-geist text-ink shadow-none"
      >
        <div className="flex items-center gap-2.5 p-3.5">
          <AccountAvatar size={40} className="border border-brand-border" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate text-body font-medium text-ink">{name}</p>
            <p className="truncate text-label text-ink-2">{subtitle}</p>
          </div>
        </div>
        <DropdownMenuSeparator className="m-0 bg-glass-divider" />
        <div className="flex flex-col gap-2 px-3.5 py-3">
          <p className="text-label text-ink-3">Theme</p>
          <ThemeSwitcher wide />
        </div>
        <DropdownMenuSeparator className="m-0 bg-glass-divider" />
        <DropdownMenuItem className={ITEM} onClick={() => navigate({ to: "/admin/settings" })}>
          Account settings
        </DropdownMenuItem>
        <DropdownMenuItem className={ITEM} onClick={() => startTour()}>
          Take the dashboard tour
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={ITEM}>
          <a href={`mailto:${SUPPORT_EMAIL}`}>Help &amp; support</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="m-0 bg-glass-divider" />
        <DropdownMenuItem
          className={cn(ITEM, "text-danger focus:text-danger data-[highlighted]:text-danger")}
          onClick={async () => {
            await logout();
            navigate({ to: "/login" });
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
