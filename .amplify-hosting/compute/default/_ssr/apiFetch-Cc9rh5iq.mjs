import { g as getApiBaseUrl } from "./router-CXpZMrmV.mjs";
async function apiFetch(path, options = {}) {
  const { token, headers: initHeaders, body, ...rest } = options;
  const headers = new Headers(initHeaders);
  if (body !== void 0 && body !== null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token?.trim()) {
    headers.set("Authorization", `Bearer ${token.trim()}`);
  }
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers,
    body
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.message === "string" ? data.message : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}
export {
  apiFetch as a
};
