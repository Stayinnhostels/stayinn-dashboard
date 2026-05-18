import { apiFetch } from "@/api/apiFetch";
import { mapApiUserToAdminUser, type AdminUser, type ApiUser, type UsersListParams, type UsersPagination } from "@/types/domain/user.types";

type GetUsersResponse = {
  success: boolean;
  users: ApiUser[];
  pagination: UsersPagination;
};

export async function getUsersApi(
  token: string,
  params: UsersListParams = {},
): Promise<{ users: AdminUser[]; pagination: UsersPagination }> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.role) search.set("role", params.role);
  if (params.search?.trim()) search.set("search", params.search.trim());

  const q = search.toString();
  const data = await apiFetch<GetUsersResponse>(`/api/v1/users${q ? `?${q}` : ""}`, { token });
  if (!data.success || !Array.isArray(data.users)) {
    throw new Error("Invalid users list response");
  }
  return {
    users: data.users.map(mapApiUserToAdminUser),
    pagination: data.pagination,
  };
}
