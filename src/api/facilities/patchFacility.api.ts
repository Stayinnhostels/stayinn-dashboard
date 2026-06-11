import { apiFetch } from "@/api/apiFetch";
import type { Facility, FacilityUpdateInput } from "@/types/domain/facility.types";

type Response = { success: boolean; facility: Facility };

export async function patchFacilityApi(token: string, id: string, input: FacilityUpdateInput) {
  const data = await apiFetch<Response>(`/api/v1/facilities/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!data.success || !data.facility) throw new Error("Failed to update facility");
  return data.facility;
}
