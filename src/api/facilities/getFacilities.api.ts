import { apiFetch } from "@/api/apiFetch";
import type { Facility, FacilityStats } from "@/types/domain/facility.types";

type Response = { success: boolean; facilities: Facility[]; missing_default_count?: number; stats?: FacilityStats };

export async function getFacilitiesApi(token: string) {
  const data = await apiFetch<Response>("/api/v1/facilities", { token });
  if (!data.success || !Array.isArray(data.facilities)) {
    throw new Error("Invalid facilities response");
  }
  return {
    facilities: data.facilities,
    missingDefaultCount: data.missing_default_count ?? 0,
    stats: data.stats ?? null,
  };
}

/** Save the website order (Figma 12.01 drag to reorder). */
export async function putFacilityOrderApi(token: string, ids: string[]) {
  const data = await apiFetch<{ success: boolean; message?: string }>("/api/v1/facilities/order", { token, method: "PUT", body: JSON.stringify({ ids }) });
  if (!data.success) throw new Error(data.message ?? "Could not save the order");
}
