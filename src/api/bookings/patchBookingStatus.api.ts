import { apiFetch } from "@/api/apiFetch";
import type { Booking, BookingStatus } from "@/types/domain/booking.types";

type PatchResponse = {
  success: boolean;
  booking: Booking;
};

export async function patchBookingStatusApi(token: string, id: string, status: BookingStatus) {
  const data = await apiFetch<PatchResponse>(`/api/v1/bookings/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
  if (!data.success || !data.booking) {
    throw new Error("Failed to update booking");
  }
  return data.booking;
}
