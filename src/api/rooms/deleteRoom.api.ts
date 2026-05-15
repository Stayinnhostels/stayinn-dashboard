import { apiFetch } from "@/api/apiFetch";

export async function deleteRoomApi(token: string, id: string): Promise<void> {
  await apiFetch<{ success: boolean; message?: string }>(
    `/api/v1/rooms/${encodeURIComponent(id)}`,
    { method: "DELETE", token },
  );
}
