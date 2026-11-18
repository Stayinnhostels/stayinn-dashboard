import { apiFetch } from "@/api/apiFetch";
import type { Booking } from "@/types/domain/booking.types";
import type { DepositsOverview, PaymentsOverview, TransactionsParams, TransactionsResponse } from "@/types/domain/payments.types";

function qs(params: Record<string, unknown>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v != null && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const getPaymentsOverviewApi = (token: string, params: { month?: string; hostel?: string; currency?: "pkr" | "usd" }) =>
  apiFetch<PaymentsOverview & { success: boolean }>(`/api/v1/payments/overview${qs(params)}`, { token });

export const getTransactionsApi = (token: string, params: TransactionsParams) =>
  apiFetch<TransactionsResponse & { success: boolean }>(`/api/v1/payments/transactions${qs(params)}`, { token });

export const getDepositsOverviewApi = (token: string, params: { month?: string; hostel?: string; currency?: "pkr" | "usd" }) =>
  apiFetch<DepositsOverview & { success: boolean }>(`/api/v1/payments/deposits${qs(params)}`, { token });

export type EditPaymentInput = { method?: string; reference?: string; paid_at?: string; paid_time?: string; note?: string; proof?: string; proof_name?: string };

export const patchPaymentApi = (token: string, bookingId: string, paymentId: string, input: EditPaymentInput) =>
  apiFetch<{ success: boolean; booking: Booking }>(`/api/v1/bookings/${bookingId}/payments/${paymentId}`, { token, method: "PATCH", body: JSON.stringify(input) });

export const getPaymentProofApi = (token: string, bookingId: string, paymentId: string) =>
  apiFetch<{ success: boolean; proof: string; name: string }>(`/api/v1/bookings/${bookingId}/payments/${paymentId}/proof`, { token });

export const refundPaymentApi = (token: string, bookingId: string, paymentId: string, input: { amount?: number; method?: string; reason?: string }) =>
  apiFetch<{ success: boolean; reference: string; booking: Booking }>(`/api/v1/bookings/${bookingId}/payments/${paymentId}/refund`, { token, method: "POST", body: JSON.stringify(input) });
