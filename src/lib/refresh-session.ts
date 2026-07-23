import { postRefreshApi } from "@/api/auth/postRefresh.api";
import { assertSuperAdminConsoleUser, mapLoginUserDtoToAuthUser } from "@/lib/auth-map-user";
import { useAuthStore } from "@/stores/auth/auth.store";

let refreshInFlight: Promise<string | null> | null = null;

/** Exchange the stored refresh token for a new access token. Single-flight. */
export async function refreshDashboardSession(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) return null;

    try {
      const data = await postRefreshApi(refreshToken);
      const user = mapLoginUserDtoToAuthUser(data.user);
      assertSuperAdminConsoleUser(user);
      const remember =
        typeof window !== "undefined" && Boolean(localStorage.getItem("stayinn.dashboard.session"));
      useAuthStore.getState().persistSession({
        user,
        token: data.token,
        refreshToken: data.refreshToken,
        remember,
      });
      return data.token;
    } catch {
      useAuthStore.getState().logout();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}
