import { apiFetch } from "@/api/apiFetch";
import type { Hostel } from "@/types/domain/hostel.types";

type HostelActionResponse = {
  success: boolean;
  message?: string;
  hostel?: Hostel;
};

export async function setDefaultHostelApi(token: string, id: string): Promise<Hostel> {
  const data = await apiFetch<HostelActionResponse>(`/api/v1/hostels/${id}/set-default`, {
    method: "POST",
    token,
  });
  if (!data.success || !data.hostel) {
    throw new Error(data.message ?? "Failed to set default property");
  }
  return data.hostel;
}

export async function pauseHostelApi(token: string, id: string): Promise<Hostel> {
  const data = await apiFetch<HostelActionResponse>(`/api/v1/hostels/${id}/pause`, {
    method: "POST",
    token,
  });
  if (!data.success || !data.hostel) {
    throw new Error(data.message ?? "Failed to pause property");
  }
  return data.hostel;
}
