import { apiFetch } from "@/api/apiFetch";
import type { Hostel } from "@/types/domain/hostel.types";

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
