import { getApiBaseUrl } from "@/api/client";

type ApiFetchOptions = RequestInit & {
  token?: string | null;
  body?: BodyInit | null;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers: initHeaders, body, ...rest } = options;
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

  const data = (await res.json().catch(() => ({}))) as T & { message?: string; success?: boolean };

  if (!res.ok) {
    const msg =
      typeof data.message === "string" ? data.message : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}
