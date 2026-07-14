import { apiFetch } from "@/api/apiFetch";
import type { Booking } from "@/types/domain/booking.types";
import type { RecordSecurityMovementInput } from "@/types/domain/security-payment.types";

type PostSecurityMovementResponse = {
  success: boolean;
  message?: string;
  booking: Booking;
};

export async function postSecurityMovementApi(
  token: string,
  bookingId: string,
  input: RecordSecurityMovementInput,
) {
  const data = await apiFetch<PostSecurityMovementResponse>(`/api/v1/bookings/${bookingId}/security`, {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
  if (!data.success || !data.booking) {
    throw new Error(data.message ?? "Could not update security payment");
  }
  return data.booking;
}
