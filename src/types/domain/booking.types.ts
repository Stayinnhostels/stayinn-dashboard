import type { ResidentExtra, ResidentType, SecurityStatus } from "@/types/domain/resident.types";

export type BookingStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

export type BookingRentLedgerEntry = {
  month: string;
  rent_amount: number | null;
  payment_status: string;
};

export type SecurityLedgerEntry = {
  id?: string;
  type: "deposit" | "refund" | "forfeit" | "adjustment";
  amount: number;
  balance_after: number;
  note: string;
  payer_name: string;
  recorded_at: string | null;
};

export type Booking = {
  id: string;
  room_id: string | null;
  room_title: string | null;
  user_id: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_company?: string;
  guest_institution?: string;
  resident_type?: ResidentType;
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
  security_remaining?: number;
  security_ledger?: SecurityLedgerEntry[];
  currency?: "pkr" | "usd" | null;
  amount_refunded?: number | null;
  amount_retained?: number | null;
  rent_ledger?: BookingRentLedgerEntry[];
  resident_extras?: ResidentExtra[];
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
  /** Check-in (move-in) date range, YYYY-MM-DD */
  move_in_from?: string;
  move_in_to?: string;
  /** Check-out date range, YYYY-MM-DD */
  check_out_from?: string;
  check_out_to?: string;
};

export type BookingsPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};
