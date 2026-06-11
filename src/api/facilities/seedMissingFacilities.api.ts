import { apiFetch } from "@/api/apiFetch";

type Response = { success: boolean; added: number; message?: string };

export async function seedMissingFacilitiesApi(token: string) {
  const data = await apiFetch<Response>("/api/v1/facilities/seed-missing", {
    method: "POST",
    token,
  });
  if (!data.success) throw new Error("Failed to add default facilities");
  return data;
}
