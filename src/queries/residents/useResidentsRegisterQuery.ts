import { useQuery } from "@tanstack/react-query";
import { getResidentsRegisterApi } from "@/api/residents";
import { residentKeys } from "@/queries/keys/resident.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { ResidentRegisterParams } from "@/types/domain/resident.types";

export function useResidentsRegisterQuery(params: ResidentRegisterParams = {}) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: residentKeys.register(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view residents");
      return getResidentsRegisterApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 30_000,
  });
}
