import { getApiBaseUrl } from "@/api/client";
import { refreshDashboardSession } from "@/lib/refresh-session";

type ApiFetchOptions = RequestInit & {
  token?: string | null;
  body?: BodyInit | null;
  /** Skip automatic refresh+retry on 401 (used by refresh itself). */
  skipAuthRefresh?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers: initHeaders, body, skipAuthRefresh, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined && body !== null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token?.trim()) {
    headers.set("Authorization", `Bearer ${token.trim()}`);
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers,
    body,
  });

  if (res.status === 401 && !skipAuthRefresh && path !== "/api/auth/refresh") {
    const nextToken = await refreshDashboardSession();
    if (nextToken) {
      return apiFetch<T>(path, { ...options, token: nextToken, skipAuthRefresh: true });
    }
  }

  const data = (await res.json().catch(() => ({}))) as T & { message?: string; success?: boolean };

  if (!res.ok) {
    const msg =
      typeof data.message === "string" ? data.message : `Request failed (${res.status})`;
    throw new ApiError(msg, res.status);
  }

  return data;
}
