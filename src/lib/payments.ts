import type { PaymentStatus } from "@/types/domain/payment.types";

export const PAYMENT_SUCCEEDED_STATUSES: PaymentStatus[] = ["succeeded"];

export function formatPaymentInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function paymentMethodLabel(method: string, source?: string) {
  if (method === "walk_in" || source === "walk_in") return "Walk-in / cash";
  if (source === "website") return "Offline (website booking)";
  return "Offline";
}

export function paymentStatusLabel(status: PaymentStatus) {
  return status;
}
