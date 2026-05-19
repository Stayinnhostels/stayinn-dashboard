import { apiFetch } from "@/api/apiFetch";
import type { MaintenanceDraft, MaintenanceTicket } from "@/types/domain/maintenance.types";

type PostMaintenanceResponse = {
  success: boolean;
  message?: string;
  maintenance: MaintenanceTicket;
};

export async function postMaintenanceApi(token: string, input: MaintenanceDraft) {
  const data = await apiFetch<PostMaintenanceResponse>("/api/v1/maintenance", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
  if (!data.success || !data.maintenance) {
    throw new Error(data.message ?? "Could not create ticket");
  }
  return data.maintenance;
}
