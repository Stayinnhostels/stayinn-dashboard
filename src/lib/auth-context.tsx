import * as React from "react";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { postLogoutApi } from "@/api/auth/postLogout.api";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useLiveAlertsStore } from "@/stores/notifications/live-alerts.store";
import { authKeys } from "@/queries/keys/auth.keys";
import { clearDashboardThemeCache } from "@/lib/dashboard-theme-storage";

export type { AuthUser, UserRole } from "@/types/domain/auth.types";

/**
 * Hydrates Zustand auth from storage on mount. Mutations (e.g. login) use React Query + `useAuthStore.persistSession`.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);
  return <>{children}</>;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const loading = useAuthStore((s) => s.loading);
  const storeLogout = useAuthStore((s) => s.logout);

  const logout = useCallback(async () => {
    const currentToken = useAuthStore.getState().token;
    try {
      if (currentToken) {
        await postLogoutApi(currentToken);
      }
    } catch {
      // Still clear local session if the network fails or the token was already invalid.
    }
    storeLogout();
    clearDashboardThemeCache();
    try {
      sessionStorage.removeItem("stayinn-missed-bookings-announced");
    } catch {
      /* ignore */
    }
    useLiveAlertsStore.getState().clear();
    queryClient.removeQueries({ queryKey: authKeys.all });
  }, [queryClient, storeLogout]);

  const isAdmin = user?.role === "super_admin";
  return { user, token, loading, isAdmin, logout };
}
