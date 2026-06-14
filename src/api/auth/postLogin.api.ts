import { getApiBaseUrl } from "@/api/client";
import type { LoginApiRequestBody } from "@/types/api/auth/login.request.types";
import type { LoginApiResponseJson, LoginApiSuccessResponse } from "@/types/api/auth/login.response.types";

function assertProductionApiConfigured() {
  if (!import.meta.env.PROD) return;
  const base = getApiBaseUrl();
  if (base.includes("localhost") || base.includes("127.0.0.1")) {
    throw new Error(
      "This build still points at localhost. Set VITE_API_BASE_URL in Amplify (or Vercel) and redeploy so login hits your real API.",
    );
  }
  if (/^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(base)) {
    throw new Error(
      "This build still points at a raw IP address. Set VITE_API_BASE_URL=https://api.stsofficial.online in Amplify and redeploy.",
    );
  }
}

export async function postLoginApi(body: LoginApiRequestBody): Promise<LoginApiSuccessResponse> {
  assertProductionApiConfigured();

  const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: body.email.trim().toLowerCase(),
      password: body.password,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as LoginApiResponseJson;

  if (!res.ok) {
    const msg = typeof data.message === "string" ? data.message : `Sign in failed (${res.status})`;
    throw new Error(msg);
  }

  if (!data.success || !data.token || !data.user) {
    throw new Error(typeof data.message === "string" ? data.message : "Invalid response from server");
  }

  return {
    success: true,
    message: data.message,
    user: data.user,
    token: data.token,
  };
}
