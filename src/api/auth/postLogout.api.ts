import { getApiBaseUrl } from "@/api/client";
import type { LogoutApiResponseJson } from "@/types/api/auth/logout.response.types";

/**
 * Revokes the JWT / refresh token on the server (`POST /api/auth/logout`).
 */
export async function postLogoutApi(
  accessToken: string | null | undefined,
  refreshToken?: string | null,
): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken?.trim()) {
    headers.Authorization = `Bearer ${accessToken.trim()}`;
  }

  const res = await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
    method: "POST",
    headers,
    body: JSON.stringify(refreshToken ? { refreshToken } : {}),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as LogoutApiResponseJson;
    const msg = typeof data.message === "string" ? data.message : `Logout failed (${res.status})`;
    throw new Error(msg);
  }
}
