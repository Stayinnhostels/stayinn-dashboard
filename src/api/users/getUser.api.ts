import { apiFetch } from "@/api/apiFetch";
import { mapApiUserToAdminUser, type AdminUser, type ApiUser } from "@/types/domain/user.types";

type GetUserResponse = {
  success: boolean;
  user: ApiUser;
};

export async function getUserApi(token: string, id: string): Promise<AdminUser> {
  const data = await apiFetch<GetUserResponse>(`/api/v1/users/${encodeURIComponent(id)}`, { token });
  if (!data.success || !data.user) {
    throw new Error("Invalid user response");
  }
  return mapApiUserToAdminUser(data.user);
}
