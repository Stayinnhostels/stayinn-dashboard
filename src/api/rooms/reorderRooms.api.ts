import { apiFetch } from "@/api/apiFetch";
import type { Room } from "@/types/domain/room.types";

type ReorderRoomsResponse = {
  success: boolean;
  message?: string;
  rooms: Room[];
};

export async function reorderRoomsApi(
  token: string,
  orderedIds: string[],
): Promise<Room[]> {
  const data = await apiFetch<ReorderRoomsResponse>("/api/v1/rooms/reorder", {
    method: "PATCH",
    token,
    body: JSON.stringify({ orderedIds }),
  });
  if (!data.success || !Array.isArray(data.rooms)) {
    throw new Error(data.message ?? "Failed to reorder rooms");
  }
  return data.rooms;
}
