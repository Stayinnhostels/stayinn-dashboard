import { apiFetch } from "@/api/apiFetch";
import { roomDraftToPatchPayload } from "@/api/rooms/roomBody";
import type { Room, RoomDraft } from "@/types/domain/room.types";

type PatchRoomResponse = {
  success: boolean;
  message?: string;
  room: Room;
};

export async function patchRoomApi(
  token: string,
  id: string,
  draft: RoomDraft | Partial<RoomDraft>,
): Promise<Room> {
  const payload = roomDraftToPatchPayload(draft);

  const data = await apiFetch<PatchRoomResponse>(`/api/v1/rooms/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
  if (!data.success || !data.room) {
    throw new Error(data.message ?? "Failed to update room");
  }
  return data.room;
}
