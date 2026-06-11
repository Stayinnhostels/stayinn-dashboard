import type { SecurityStatus } from "@/types/domain/resident.types";

export type BookingStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

export type BookingRentLedgerEntry = {
  month: string;
  rent_amount: number | null;
  payment_status: string;
};

export type Booking = {
  id: string;
  room_id: string | null;
  room_title: string | null;
  user_id: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  seats_booked: number;
  stay_unit?: "month" | "night";
  nights?: number | null;
  months: number;
  months_paid_upfront?: number | null;
  move_in: string | null;
  check_out: string | null;
  price_per_seat: number;
  total_amount: number;
  amount_paid_upfront?: number;
  amount_outstanding?: number;
  security_status?: SecurityStatus;
  security_amount?: number | null;
  security_returned?: number | null;
  security_retained?: number | null;
  currency?: "pkr" | "usd" | null;
  amount_refunded?: number | null;
  amount_retained?: number | null;
  rent_ledger?: BookingRentLedgerEntry[];
  status: BookingStatus;
  source: string;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type BookingsListParams = {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  room_id?: string;
  search?: string;
};

export type BookingsPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};
