import { getApiBaseUrl } from "@/api/client";
import type { LogoutApiResponseJson } from "@/types/api/auth/logout.response.types";

/**
 * Revokes the JWT on the server (`POST /api/auth/logout`).
 */
export async function postLogoutApi(accessToken: string): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.trim()}`,
    },
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as LogoutApiResponseJson;
    const msg = typeof data.message === "string" ? data.message : `Logout failed (${res.status})`;
    throw new Error(msg);
  }
}
