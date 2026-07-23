import { getApiBaseUrl } from "@/api/client";
import { refreshDashboardSession } from "@/lib/refresh-session";

/** Authenticated fetch with one automatic refresh+retry on 401. */
export async function authFetch(path: string, init: RequestInit = {}, token?: string | null): Promise<Response> {
  const headers = new Headers(init.headers);
  const access = token?.trim();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  const res = await fetch(`${getApiBaseUrl()}${path}`, { ...init, headers });
  if (res.status !== 401) return res;

  const nextToken = await refreshDashboardSession();
  if (!nextToken) return res;

  const retryHeaders = new Headers(init.headers);
  retryHeaders.set("Authorization", `Bearer ${nextToken}`);
  return fetch(`${getApiBaseUrl()}${path}`, { ...init, headers: retryHeaders });
}
