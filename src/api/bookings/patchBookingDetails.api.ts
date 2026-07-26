import { apiFetch } from "@/api/apiFetch";
import type { Booking } from "@/types/domain/booking.types";

export type UpdateBookingDetailsInput = {
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  source?: string;
  notes?: string;
  move_in?: string;
  check_out?: string;
  months?: number;
  nights?: number;
  seats_booked?: number;
  price_per_seat?: number;
  total_amount?: number;
  recalculate_total?: boolean;
};

type PatchBookingDetailsResponse = {
  success: boolean;
  message?: string;
  booking: Booking;
};

export async function patchBookingDetailsApi(
  token: string,
  id: string,
  input: UpdateBookingDetailsInput,
) {
  const data = await apiFetch<PatchBookingDetailsResponse>(
    `/api/v1/bookings/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(input),
    },
  );
  if (!data.success || !data.booking) {
    throw new Error(data.message ?? "Could not update booking details");
  }
  return data.booking;
}
