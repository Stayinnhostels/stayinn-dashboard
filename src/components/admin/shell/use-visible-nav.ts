import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth/auth.store";
import { canUseRoute } from "@/lib/staff-access";
import { filterNav } from "./admin-nav";

/** Sidebar / tab bar / ⌘K items the signed-in user may open (staff roles see only their areas). */
export function useVisibleNav() {
  const user = useAuthStore((s) => s.user);
  return useMemo(() => filterNav((to) => canUseRoute(user, to)), [user]);
}
