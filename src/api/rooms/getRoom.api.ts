import { apiFetch } from "@/api/apiFetch";
import type { Room } from "@/types/domain/room.types";

type GetRoomResponse = {
  success: boolean;
  room: Room;
};

export async function getRoomApi(id: string): Promise<Room> {
  const data = await apiFetch<GetRoomResponse>(`/api/v1/rooms/${encodeURIComponent(id)}`);
  if (!data.success || !data.room) {
    throw new Error("Invalid room response");
  }
  return data.room;
}
