import { apiFetch } from "@/api/apiFetch";
import type { Booking } from "@/types/domain/booking.types";

type GetBookingResponse = {
  success: boolean;
  booking: Booking;
};

export async function getBookingApi(token: string, id: string): Promise<Booking> {
  const data = await apiFetch<GetBookingResponse>(`/api/v1/bookings/${encodeURIComponent(id)}`, { token });
  if (!data.success || !data.booking) {
    throw new Error("Invalid booking response");
  }
  return data.booking;
}
