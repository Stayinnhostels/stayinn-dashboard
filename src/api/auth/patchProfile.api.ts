import { apiFetch } from "@/api/apiFetch";
import { mapLoginUserDtoToAuthUser } from "@/lib/auth-map-user";
import type { LoginApiUserDto } from "@/types/api/auth/login.response.types";
import type { AuthUser } from "@/types/domain/auth.types";

type MeResponse = {
  success: boolean;
  message?: string;
  user: LoginApiUserDto;
};

export type UpdateProfileInput = {
  name?: string;
  avatar?: string | null;
};

export async function getMeApi(token: string): Promise<AuthUser> {
  const data = await apiFetch<MeResponse>("/api/auth/me", { token });
  if (!data.success || !data.user) {
    throw new Error(data.message ?? "Could not load profile");
  }
  return mapLoginUserDtoToAuthUser(data.user);
}

export async function patchProfileApi(token: string, input: UpdateProfileInput): Promise<AuthUser> {
  const data = await apiFetch<MeResponse>("/api/auth/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  });
  if (!data.success || !data.user) {
    throw new Error(data.message ?? "Could not update profile");
  }
  return mapLoginUserDtoToAuthUser(data.user);
}
