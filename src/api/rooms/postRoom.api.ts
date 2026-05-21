import { apiFetch } from "@/api/apiFetch";
import { roomDraftToApiBody } from "@/api/rooms/roomBody";
import type { Room, RoomDraft } from "@/types/domain/room.types";

type PostRoomResponse = {
  success: boolean;
  message?: string;
  room: Room;
};

export async function postRoomApi(token: string, draft: RoomDraft): Promise<Room> {
  const data = await apiFetch<PostRoomResponse>("/api/v1/rooms", {
    method: "POST",
    token,
    body: JSON.stringify(roomDraftToApiBody(draft)),
  });
  if (!data.success || !data.room) {
    throw new Error(data.message ?? "Failed to create room");
  }
  return data.room;
}
