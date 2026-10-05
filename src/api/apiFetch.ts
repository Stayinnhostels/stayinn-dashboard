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

type ApiErrorBody = {
  message?: string;
  errors?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
  };
};

const FIELD_LABELS: Record<string, string> = {
  slug: "URL slug",
  name: "Name",
  email: "Email",
};

function formatApiErrorMessage(data: ApiErrorBody, status: number): string {
  const parts: string[] = [];

  for (const msg of data.errors?.formErrors ?? []) {
    if (msg.trim()) parts.push(msg.trim());
  }

  for (const [field, messages] of Object.entries(data.errors?.fieldErrors ?? {})) {
    const label = FIELD_LABELS[field] ?? field;
    for (const msg of messages) {
      if (msg.trim()) parts.push(`${label}: ${msg.trim()}`);
    }
  }

  if (parts.length > 0) return parts.join(" · ");

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  return `Request failed (${status})`;
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

  // nginx often returns HTML for 413 without CORS JSON — surface a clear message.
  if (res.status === 413) {
    throw new ApiError(
      "Upload too large for the server. Use smaller CNIC photos/PDF, or raise nginx client_max_body_size on the API host.",
      413,
    );
  }

  if (res.status === 401 && !skipAuthRefresh && path !== "/api/auth/refresh") {
    const nextToken = await refreshDashboardSession();
    if (nextToken) {
      return apiFetch<T>(path, { ...options, token: nextToken, skipAuthRefresh: true });
    }
  }

  const data = (await res.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!res.ok) {
    throw new ApiError(formatApiErrorMessage(data, res.status), res.status);
  }

  return data;
}
