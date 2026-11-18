import { apiFetch } from "@/api/apiFetch";
import type { ReturningGuest, RoomAvailability, RoomBeds } from "@/types/domain/room-beds.types";

export async function getRoomBedsApi(token: string, roomId: string): Promise<RoomBeds> {
  const data = await apiFetch<{ success: boolean } & RoomBeds>(
    `/api/v1/rooms/${encodeURIComponent(roomId)}/beds`,
    { token },
  );
  if (!data.success) throw new Error("Invalid room beds response");
  return data;
}

export async function getRoomAvailabilityApi(
  token: string,
  params: { hostel?: string; search?: string } = {},
): Promise<RoomAvailability[]> {
  const q = new URLSearchParams();
  if (params.hostel) q.set("hostel", params.hostel);
  if (params.search?.trim()) q.set("search", params.search.trim());
  const s = q.toString();
  const data = await apiFetch<{ success: boolean; rooms: RoomAvailability[] }>(
    `/api/v1/rooms/availability${s ? `?${s}` : ""}`,
    { token },
  );
  return data.rooms ?? [];
}

export async function getReturningGuestApi(
  token: string,
  params: { phone?: string; cnic?: string },
): Promise<ReturningGuest | null> {
  const q = new URLSearchParams();
  if (params.phone) q.set("phone", params.phone);
  if (params.cnic) q.set("cnic", params.cnic);
  const data = await apiFetch<{ success: boolean; guest: ReturningGuest | null }>(
    `/api/v1/bookings/guest-lookup?${q.toString()}`,
    { token },
  );
  return data.guest ?? null;
}

/** Housekeeping / bed ops on a room (Mark for cleaning, out-of-service beds, gender policy). */
export async function patchRoomOpsApi(
  token: string,
  roomId: string,
  fields: {
    housekeeping_status?: "ready" | "needs_cleaning";
    last_cleaned_at?: string | null;
    beds_out_of_service?: number[];
    gender_policy?: "mixed" | "male" | "female";
  },
) {
  return apiFetch<{ success: boolean }>(`/api/v1/rooms/${encodeURIComponent(roomId)}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(fields),
  });
}
