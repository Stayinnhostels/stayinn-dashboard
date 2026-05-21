import type { PaymentStatus } from "@/types/domain/payment.types";

export type MoneyCurrency = "pkr" | "usd";

export const PAYMENT_SUCCEEDED_STATUSES: PaymentStatus[] = ["succeeded"];

export function normalizeMoneyCurrency(currency?: string | null): MoneyCurrency {
  const c = String(currency ?? "pkr").trim().toLowerCase();
  if (c === "usd" || c === "$") return "usd";
  return "pkr";
}

export function formatMoney(amount: number, currency: MoneyCurrency | string = "pkr") {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  if (normalizeMoneyCurrency(currency) === "usd") {
    return `$${safe.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  return `Rs ${safe.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

/** @deprecated Use formatMoney(amount, currency) */
export function formatPaymentInr(amount: number) {
  return formatMoney(amount, "pkr");
}

export function paymentMethodLabel(method: string, source?: string) {
  if (method === "walk_in" || source === "walk_in") return "Walk-in / cash";
  if (source === "website") return "Offline (website booking)";
  return "Offline";
}

/** Recharts passes Bar `name` (e.g. "USD") or `dataKey` (e.g. "revenue_usd") to Tooltip. */
export function currencyFromChartSeries(seriesName: unknown): MoneyCurrency {
  const key = String(seriesName ?? "").toLowerCase();
  if (key === "usd" || key === "revenue_usd") return "usd";
  return "pkr";
}

export function chartTooltipMoney(value: unknown, seriesName: unknown) {
  const n = Array.isArray(value) ? Number(value[0]) : Number(value);
  const cur = currencyFromChartSeries(seriesName);
  return [formatMoney(Number.isFinite(n) ? n : 0, cur), cur === "usd" ? "USD" : "PKR"] as const;
}

export function paymentStatusLabel(status: PaymentStatus) {
  switch (status) {
    case "partial_refund":
      return "Partial refund";
    case "succeeded":
      return "Succeeded";
    case "refunded":
      return "Refunded";
    case "pending":
      return "Pending";
    case "cancelled":
      return "Cancelled";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}
