import { useQuery } from "@tanstack/react-query";
import { getResidentMonthsApi } from "@/api/residents";
import { residentKeys } from "@/queries/keys/resident.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

export function useResidentMonthsQuery() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: residentKeys.months(),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getResidentMonthsApi(token);
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}
