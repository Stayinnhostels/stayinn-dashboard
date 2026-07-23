import { getApiBaseUrl } from "@/api/client";
import type { LoginApiUserDto } from "@/types/api/auth/login.response.types";

export type RefreshApiSuccessResponse = {
  success: true;
  message?: string;
  user: LoginApiUserDto;
  token: string;
  refreshToken: string;
  expiresIn?: string;
};

type RefreshApiResponseJson = Partial<RefreshApiSuccessResponse> & {
  success?: boolean;
  message?: string;
};

export async function postRefreshApi(refreshToken: string): Promise<RefreshApiSuccessResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = (await res.json().catch(() => ({}))) as RefreshApiResponseJson;

  if (!res.ok) {
    const msg = typeof data.message === "string" ? data.message : `Session refresh failed (${res.status})`;
    throw new Error(msg);
  }

  if (!data.success || !data.token || !data.refreshToken || !data.user) {
    throw new Error(typeof data.message === "string" ? data.message : "Invalid refresh response");
  }

  return {
    success: true,
    message: data.message,
    user: data.user,
    token: data.token,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
  };
}
