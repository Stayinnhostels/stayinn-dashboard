import { apiFetch } from "@/api/apiFetch";
import type { Booking } from "@/types/domain/booking.types";

export type TransferBookingRoomInput = {
  room_id: string;
  seat_label?: string;
  note?: string;
};

type PatchBookingRoomResponse = {
  success: boolean;
  message?: string;
  booking: Booking;
};

export async function patchBookingRoomApi(
  token: string,
  id: string,
  input: TransferBookingRoomInput,
) {
  const data = await apiFetch<PatchBookingRoomResponse>(
    `/api/v1/bookings/${encodeURIComponent(id)}/room`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(input),
    },
  );
  if (!data.success || !data.booking) {
    throw new Error(data.message ?? "Could not change room");
  }
  return data.booking;
}
