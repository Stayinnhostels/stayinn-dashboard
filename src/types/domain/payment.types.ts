import type { BookingStatus } from "@/types/domain/booking.types";

export type PaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded"
  | "partial_refund"
  | "cancelled";

export type Payment = {
  id: string;
  booking_id: string;
  amount: number;
  total_amount?: number;
  collected_rent?: number;
  extras_due?: number;
  extras_collected?: number;
  rent_due?: number;
  rent_collected?: number;
  amount_refunded?: number;
  amount_retained?: number;
  currency: string;
  status: PaymentStatus;
  /** Rent ledger status when viewing a specific month */
  ledger_status?: "paid" | "not_paid" | "returned" | "partial";
  month?: string;
  month_label?: string;
  method: string;
  source: string;
  guest_name: string;
  guest_email: string;
  room_id: string | null;
  room_title: string | null;
  booking_status: BookingStatus;
  created_at: string | null;
  updated_at: string | null;
};

export type PaymentsListParams = {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  search?: string;
  /** YYYY-MM — rent payments & stats for that month (past or future) */
  month?: string;
};

export type PaymentsPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type CurrencyRevenueBucket = {
  total: number;
  month: number;
  week: number;
  succeeded_count: number;
  pending_count: number;
  outstanding_count?: number;
  refunded_count: number;
  pending_amount: number;
  outstanding_rent?: number;
  refunded_amount: number;
};

export type RevenueSummary = {
  pkr: CurrencyRevenueBucket;
  usd: CurrencyRevenueBucket;
};

export type MonthPaymentCurrencyStats = {
  due: number;
  collected: number;
  unpaid: number;
  rent_due?: number;
  rent_collected?: number;
  extras_due?: number;
  extras_collected?: number;
  paid_count: number;
  unpaid_count: number;
  partial_count: number;
  resident_count: number;
};

export type MonthPaymentStats = {
  month: string;
  label: string;
  pkr: MonthPaymentCurrencyStats;
  usd: MonthPaymentCurrencyStats;
  revenue_pkr: number;
  revenue_usd: number;
};
