import { apiFetch } from "@/api/apiFetch";
import { authFetch } from "@/api/authFetch";
import { filenameFromContentDisposition, triggerBrowserDownload } from "@/lib/download-blob";
import type {
  MaintenanceListParams,
  MaintenanceStats,
  MaintenanceTicket,
} from "@/types/domain/maintenance.types";

type ListMaintenanceResponse = {
  success: boolean;
  maintenance: MaintenanceTicket[];
  stats: MaintenanceStats;
};

function listSearch(params: MaintenanceListParams) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.hostel) search.set("hostel", params.hostel);
  if (params.priority) search.set("priority", params.priority);
  if (params.room_id) search.set("room_id", params.room_id);
  if (params.assignee) search.set("assignee", params.assignee);
  if (params.search?.trim()) search.set("search", params.search.trim());
  if (params.mine) search.set("mine", "1");
  return search.toString();
}

export async function getMaintenanceApi(token: string, params: MaintenanceListParams = {}) {
  const q = listSearch(params);
  const data = await apiFetch<ListMaintenanceResponse>(`/api/v1/maintenance${q ? `?${q}` : ""}`, {
    token,
  });
  if (!data.success || !Array.isArray(data.maintenance)) {
    throw new Error("Invalid maintenance list response");
  }
  return { maintenance: data.maintenance, stats: data.stats };
}

export async function getMaintenancePhotosApi(token: string, id: string) {
  const data = await apiFetch<{ success: boolean; photos: string[] }>(`/api/v1/maintenance/${encodeURIComponent(id)}/photos`, { token });
  return data.photos ?? [];
}

export async function downloadMaintenanceCsvApi(token: string, params: MaintenanceListParams = {}) {
  const q = listSearch(params);
  const res = await authFetch(`/api/v1/maintenance/export.csv${q ? `?${q}` : ""}`, {}, token);
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? `Export failed (${res.status})`);
  }
  triggerBrowserDownload(await res.blob(), filenameFromContentDisposition(res.headers.get("Content-Disposition"), "maintenance.csv"));
}
