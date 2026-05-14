import { getApiBaseUrl } from "@/api/client";
import type { LoginApiRequestBody } from "@/types/api/auth/login.request.types";
import type { LoginApiResponseJson, LoginApiSuccessResponse } from "@/types/api/auth/login.response.types";

export async function postLoginApi(body: LoginApiRequestBody): Promise<LoginApiSuccessResponse> {
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
