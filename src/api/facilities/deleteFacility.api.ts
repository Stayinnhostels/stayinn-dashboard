import { apiFetch } from "@/api/apiFetch";

type Response = { success: boolean; id: string };

export async function deleteFacilityApi(token: string, id: string) {
  const data = await apiFetch<Response>(`/api/v1/facilities/${id}`, {
    token,
    method: "DELETE",
  });
  if (!data.success) throw new Error("Failed to delete facility");
  return data.id;
}
