import { apiFetch } from "@/api/apiFetch";
import type { Hostel, HostelStats } from "@/types/domain/hostel.types";

type GetHostelsResponse = {
  success: boolean;
  hostels: Hostel[];
};

export async function getHostelsApi(token: string) {
  const data = await apiFetch<GetHostelsResponse>("/api/v1/hostels", { token });
  if (!data.success || !Array.isArray(data.hostels)) {
    throw new Error("Invalid hostels list response");
  }
  return data;
}

/** Beds, filled beds, monthly rent and card photo per property (Figma 16.02). */
export async function getHostelStatsApi(token: string) {
  const data = await apiFetch<{ success: boolean; stats: HostelStats }>("/api/v1/hostels/stats", { token });
  return data.stats ?? {};
}
