import { apiFetch } from "@/api/apiFetch";
import type { Facility, FacilityInput } from "@/types/domain/facility.types";

type Response = { success: boolean; facility: Facility };

export async function postFacilityApi(token: string, input: FacilityInput) {
  const data = await apiFetch<Response>("/api/v1/facilities", {
    token,
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!data.success || !data.facility) throw new Error("Failed to create facility");
  return data.facility;
}
