import { apiFetch } from "@/api/apiFetch";
import type { Room, RoomDraft } from "@/types/domain/room.types";

type PatchRoomResponse = {
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
  if (draft.badge === null || draft.badge === "") body.badge = null;
  else if (draft.badge?.trim()) body.badge = draft.badge.trim();
  return body;
}

function buildPatchPayload(draft: RoomDraft | Partial<RoomDraft>): Record<string, unknown> {
  if ("title" in draft && draft.title !== undefined) {
    return toBody(draft as RoomDraft);
  }
  const partial: Record<string, unknown> = {};
  const keys = [
    "title",
    "description",
    "price_per_night",
    "status",
    "category",
    "capacity",
    "beds_total",
    "beds_available",
    "amenities",
    "images",
    "badge",
  ] as const;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(draft, key)) {
      const value = draft[key];
      if (key === "badge" && (value === null || value === "")) {
        partial.badge = null;
      } else if (value !== undefined) {
        partial[key] = value;
      }
    }
  }
  return partial;
}

export async function patchRoomApi(
  token: string,
  id: string,
  draft: RoomDraft | Partial<RoomDraft>,
): Promise<Room> {
  const payload = buildPatchPayload(draft);

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
