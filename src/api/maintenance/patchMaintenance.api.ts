import { apiFetch } from "@/api/apiFetch";
import type { MaintenanceDraft, MaintenanceTicket } from "@/types/domain/maintenance.types";

type PatchMaintenanceResponse = {
  success: boolean;
  message?: string;
  maintenance: MaintenanceTicket;
};

export async function patchMaintenanceApi(
  token: string,
  id: string,
  input: Partial<MaintenanceDraft>,
) {
  const data = await apiFetch<PatchMaintenanceResponse>(`/api/v1/maintenance/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  });
  if (!data.success || !data.maintenance) {
    throw new Error(data.message ?? "Could not update ticket");
  }
  return data.maintenance;
}
