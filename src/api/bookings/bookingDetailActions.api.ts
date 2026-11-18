import { apiFetch } from "@/api/apiFetch";
import type { Booking } from "@/types/domain/booking.types";

export type RecordPaymentInput = {
  amount: number;
  method: "cash" | "card" | "bank_transfer" | "jazzcash" | "easypaisa" | "deposit";
  reference?: string;
  paid_at?: string;
  note?: string;
};

export async function postBookingPaymentApi(token: string, id: string, input: RecordPaymentInput) {
  return apiFetch<{ success: boolean; reference: string; booking: Booking }>(`/api/v1/bookings/${id}/payments`, {
    token,
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function postBookingNoteApi(token: string, id: string, text: string) {
  return apiFetch<{ success: boolean; booking: Booking }>(`/api/v1/bookings/${id}/notes`, {
    token,
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function postVerifyIdApi(token: string, id: string) {
  return apiFetch<{ success: boolean; booking: Booking }>(`/api/v1/bookings/${id}/verify-id`, { token, method: "POST" });
}

/** Receipt & invoice: email the invoice PDF to the guest (defaults to the booking email). */
export async function postEmailInvoiceApi(token: string, id: string, to?: string) {
  return apiFetch<{ success: boolean; to: string; invoice_number: string; booking: Booking }>(`/api/v1/bookings/${id}/invoice/email`, {
    token,
    method: "POST",
    body: JSON.stringify(to ? { to } : {}),
  });
}

export type InvoiceShareChannel = "whatsapp" | "print" | "download";

/** Receipt & invoice: log WhatsApp / print / download in the booking's "Sent" list. */
export async function postInvoiceSharedApi(token: string, id: string, input: { channel: InvoiceShareChannel; invoice_number?: string; to?: string }) {
  return apiFetch<{ success: boolean; booking: Booking }>(`/api/v1/bookings/${id}/invoice/shared`, {
    token,
    method: "POST",
    body: JSON.stringify(input),
  });
}
