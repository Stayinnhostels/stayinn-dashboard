import { apiFetch } from "@/api/apiFetch";
import type { MaintenanceListParams, MaintenanceStats, MaintenanceTicket } from "@/types/domain/maintenance.types";

type ListMaintenanceResponse = {
  success: boolean;
  maintenance: MaintenanceTicket[];
  stats: MaintenanceStats;
};

export async function getMaintenanceApi(token: string, params: MaintenanceListParams = {}) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);

  const q = search.toString();
  const data = await apiFetch<ListMaintenanceResponse>(
    `/api/v1/maintenance${q ? `?${q}` : ""}`,
    { token },
  );
  if (!data.success || !Array.isArray(data.maintenance)) {
    throw new Error("Invalid maintenance list response");
  }
  return { maintenance: data.maintenance, stats: data.stats };
}
