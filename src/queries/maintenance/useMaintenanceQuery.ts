import { useQuery } from "@tanstack/react-query";
import { getMaintenanceApi } from "@/api/maintenance";
import { maintenanceKeys } from "@/queries/keys/maintenance.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { MaintenanceListParams } from "@/types/domain/maintenance.types";

export function useMaintenanceQuery(params: MaintenanceListParams = {}) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: maintenanceKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view maintenance");
      return getMaintenanceApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 30_000,
  });
}
