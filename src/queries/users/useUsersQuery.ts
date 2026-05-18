import { useQuery } from "@tanstack/react-query";
import { getUsersApi } from "@/api/users";
import { userKeys } from "@/queries/keys/user.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { UsersListParams } from "@/types/domain/user.types";

export function useUsersQuery(params: UsersListParams) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view users");
      return getUsersApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 0,
  });
}
