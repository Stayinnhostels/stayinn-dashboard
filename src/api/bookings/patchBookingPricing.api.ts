import { apiFetch } from "@/api/apiFetch";
import type { Booking } from "@/types/domain/booking.types";

export type UpdateBookingPricingInput = {
  total_amount: number;
  price_per_seat?: number;
  pricing_note?: string;
};

type PatchBookingPricingResponse = {
  success: boolean;
  message?: string;
  booking: Booking;
};

export async function patchBookingPricingApi(
  token: string,
  id: string,
  input: UpdateBookingPricingInput,
) {
  const data = await apiFetch<PatchBookingPricingResponse>(
    `/api/v1/bookings/${encodeURIComponent(id)}/pricing`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(input),
    },
  );
  if (!data.success || !data.booking) {
    throw new Error(data.message ?? "Could not update booking price");
  }
  return data.booking;
}
