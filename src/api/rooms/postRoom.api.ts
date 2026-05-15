import { apiFetch } from "@/api/apiFetch";
import type { Room, RoomDraft } from "@/types/domain/room.types";

type PostRoomResponse = {
  success: boolean;
  message?: string;
  room: Room;
};

function toBody(draft: RoomDraft) {
  const body: Record<string, unknown> = {
    title: draft.title.trim(),
    description: draft.description.trim(),
    price_per_night: draft.price_per_night,
    status: draft.status,
    category: draft.category.trim(),
    capacity: draft.capacity,
    beds_total: draft.beds_total,
    beds_available: draft.beds_available,
    amenities: draft.amenities,
    images: draft.images,
  };
  if (draft.badge?.trim()) body.badge = draft.badge.trim();
  return body;
}

export async function postRoomApi(token: string, draft: RoomDraft): Promise<Room> {
  const data = await apiFetch<PostRoomResponse>("/api/v1/rooms", {
    method: "POST",
    token,
    body: JSON.stringify(toBody(draft)),
  });
  if (!data.success || !data.room) {
    throw new Error(data.message ?? "Failed to create room");
  }
  return data.room;
}
