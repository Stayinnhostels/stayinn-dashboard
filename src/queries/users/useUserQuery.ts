import { useQuery } from "@tanstack/react-query";
import { getUserApi } from "@/api/users";
import { userKeys } from "@/queries/keys/user.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

export function useUserQuery(id: string) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view this user");
      return getUserApi(token, id);
    },
    enabled: Boolean(token && id),
    staleTime: 0,
  });
}
