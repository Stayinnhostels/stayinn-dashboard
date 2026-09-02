import { useQuery } from "@tanstack/react-query";
import { getResidentsDirectoryApi } from "@/api/residents";
import { residentKeys } from "@/queries/keys/resident.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { ResidentDirectoryParams } from "@/types/domain/resident.types";

export function useResidentsDirectoryQuery(
  params: ResidentDirectoryParams = {},
  options: { enabled?: boolean } = {},
) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: residentKeys.directory(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view residents");
      return getResidentsDirectoryApi(token, params);
    },
    enabled: (options.enabled ?? true) && Boolean(token),
    staleTime: 30_000,
  });
}
