import { apiFetch } from "@/api/apiFetch";
import type { Booking } from "@/types/domain/booking.types";

export type CreateManualBookingInput = {
  room_id: string;
  guest_name: string;
  guest_email?: string;
  guest_phone: string;
  guest_cnic?: string;
  guest_guardian_contact?: string;
  guest_permanent_address?: string;
  /** Channel / company */
  source?: string;
  seats_booked: number;
  stay_unit?: "month" | "night";
  months?: number;
  nights?: number;
  months_to_pay?: number;
  nightly_rate?: number;
  move_in: string;
  notes?: string;
  total_amount?: number;
  security_amount?: number;
  price_per_seat?: number;
  currency?: "pkr" | "usd";
};

type PostManualBookingResponse = {
  success: boolean;
  message?: string;
  booking: Booking;
};

export async function postManualBookingApi(token: string, input: CreateManualBookingInput) {
  const data = await apiFetch<PostManualBookingResponse>("/api/v1/bookings/manual", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
  if (!data.success || !data.booking) {
    throw new Error(data.message ?? "Could not add member");
  }
  return data.booking;
}
