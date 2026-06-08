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
  amount_refunded?: number;
  amount_retained?: number;
  currency: string;
  status: PaymentStatus;
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
  refunded_count: number;
  pending_amount: number;
  refunded_amount: number;
};

export type RevenueSummary = {
  pkr: CurrencyRevenueBucket;
  usd: CurrencyRevenueBucket;
};
