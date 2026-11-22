import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMeApi } from "@/api/auth";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { AuthUser, UserRole } from "@/types/domain/auth.types";

/**
 * Staff roles (Figma 13.03). Super admin sees everything; other roles see the areas the
 * Staff page's permission matrix gives them. The API enforces the same areas.
 */
export const CONSOLE_ROLES: UserRole[] = ["super_admin", "front_desk", "maintenance", "accountant"];
export const isConsoleRole = (role?: string | null) => CONSOLE_ROLES.includes(role as UserRole);

export const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super admin",
  front_desk: "Front desk",
  maintenance: "Maintenance",
  accountant: "Accountant",
  user: "Guest",
};

export type StaffArea = "bookings" | "residents" | "payments" | "rooms" | "maintenance" | "finance" | "website" | "staff";

const ROUTE_AREAS: [RegExp, StaffArea][] = [
  [/^\/admin\/(bookings|booking-requests|schedule)(\/|$)/, "bookings"],
  [/^\/admin\/(residents|monthly-rent|residents-by-room)(\/|$)/, "residents"],
  [/^\/admin\/(payments|security-payments)(\/|$)/, "payments"],
  [/^\/admin\/(rooms|facilities)(\/|$)/, "rooms"],
  [/^\/admin\/maintenance(\/|$)/, "maintenance"],
  [/^\/admin\/(expenses|financials|profit-loss|coupons)(\/|$)/, "finance"],
  [/^\/admin\/(website|messages|reviews|settings|hostels)(\/|$)/, "website"],
  [/^\/admin\/(users|staff)(\/|$)/, "staff"],
];

export function areaForRoute(path: string): StaffArea | null {
  return ROUTE_AREAS.find(([re]) => re.test(path))?.[1] ?? null;
}

export function canUseRoute(user: AuthUser | null | undefined, path: string) {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  const area = areaForRoute(path);
  if (!area) return true; // dashboard home, notifications, design system
  return (user.permissions ?? []).includes(area);
}

/** Keeps the signed-in user's role + permissions fresh (role changes apply without signing out). */
export function useSyncPermissions() {
  const token = useAuthStore((s) => s.token);
  const updateUser = useAuthStore((s) => s.updateUser);
  const q = useQuery({
    queryKey: ["auth", "me", "permissions"],
    queryFn: () => getMeApi(token as string),
    enabled: Boolean(token),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
  useEffect(() => {
    if (q.data) updateUser({ role: q.data.role, permissions: q.data.permissions, jobTitle: q.data.jobTitle });
  }, [q.data, updateUser]);
}
