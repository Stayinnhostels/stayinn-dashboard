import { apiFetch } from "@/api/apiFetch";
import type { Facility } from "@/types/domain/facility.types";

type Response = { success: boolean; facilities: Facility[]; missing_default_count?: number };

export async function getFacilitiesApi(token: string) {
  const data = await apiFetch<Response>("/api/v1/facilities", { token });
  if (!data.success || !Array.isArray(data.facilities)) {
    throw new Error("Invalid facilities response");
  }
  return {
    facilities: data.facilities,
    missingDefaultCount: data.missing_default_count ?? 0,
  };
}
