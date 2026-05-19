import { apiFetch } from "@/api/apiFetch";

export async function deleteMaintenanceApi(token: string, id: string) {
  await apiFetch<{ success: boolean; message?: string }>(
    `/api/v1/maintenance/${encodeURIComponent(id)}`,
    { method: "DELETE", token },
  );
}
