import type { MaintenanceListParams } from "@/types/domain/maintenance.types";

export const maintenanceKeys = {
  all: ["maintenance"] as const,
  list: (params: MaintenanceListParams) => [...maintenanceKeys.all, "list", params] as const,
};
