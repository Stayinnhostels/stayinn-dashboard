import { apiFetch } from "@/api/apiFetch";
import type { Booking, BookingStatus } from "@/types/domain/booking.types";

type PatchResponse = {
  success: boolean;
  booking: Booking;
};

export type UpdateBookingStatusInput = {
  status: BookingStatus;
  amount_refunded?: number;
  security_returned?: number;
  checkout_rent_collected?: number;
};

export async function patchBookingStatusApi(token: string, id: string, input: UpdateBookingStatusInput) {
  const data = await apiFetch<PatchResponse>(`/api/v1/bookings/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  });
  if (!data.success || !data.booking) {
    throw new Error("Failed to update booking");
  }
  return data.booking;
}
