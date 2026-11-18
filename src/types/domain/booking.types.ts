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
  hostel_id?: string | null;
  hostel_name?: string | null;
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
  /** Planned amount to return to the guest (reminder). */
  security_returnable?: number | null;
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
  /** When the guest was actually checked in / out (null for older bookings). */
  checked_in_at?: string | null;
  checked_out_at?: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  // ── List-row extras (GET /bookings, Figma 06) ──
  booking_no?: number | null;
  /** "BK-2026-0143" */
  booking_code?: string | null;
  display_status?: BookingDisplayStatus;
  expected_arrival_time?: string | null;
  guest_gender?: string | null;
  guest_father_name?: string | null;
  guest_cnic?: string | null;
  guest_guardian_contact?: string | null;
  guest_permanent_address?: string | null;
  seat_label?: string | null;
  room_name?: string | null;
  room_number?: number | null;
  room_floor?: number | null;
  room_image?: string | null;
  rent_amount?: number;
  rent_unit?: "month" | "night";
  /** Rent + security collected so far. */
  paid_total?: number;
  /** Amount due up to today (future months excluded). */
  balance_due?: number;
  next_due_date?: string | null;
  next_due_amount?: number;
  overdue?: boolean;
  no_charge?: boolean;
  due_on_arrival?: boolean;
  id_pending?: boolean;
  returning_guest?: boolean;
  // ── Booking detail (Figma 06.07–06.11) ──
  id_type?: "cnic" | "b_form" | "passport" | null;
  guest_passport?: string | null;
  guest_guardian_name?: string | null;
  payment_method?: string | null;
  amount_received?: number | null;
  payments?: BookingPayment[];
  activity?: BookingActivity[];
  guest_history?: { since: string | null; stays: number; stay_number: number; lifetime_paid: number };
  id_verified_at?: string | null;
  id_verified_by_name?: string | null;
  checkout_checklist?: Partial<Record<"keys_returned" | "no_damage" | "minibar_checked" | "flagged_cleaning", boolean | null>> | null;
  security_deduction_reason?: string | null;
  rent_reminders_enabled?: boolean;
};

export type BookingPayment = {
  id: string;
  amount: number;
  currency: string;
  method: string;
  method_label: string;
  reference: string;
  description: string;
  note: string;
  paid_at: string | null;
  received_by_name: string;
  recorded_at?: string | null;
  kind?: "payment" | "refund";
  allocations?: { kind: "rent" | "extra" | "security"; month: string | null; label: string; amount: number; extra_id: string | null }[];
  has_proof?: boolean;
  proof_name?: string;
  proof_size?: number;
  refunded_amount?: number;
  refund_of?: string | null;
};

export type BookingActivity = {
  id: string;
  type: string;
  label: string;
  detail: string;
  actor_name: string;
  at: string | null;
};

export type BookingDisplayStatus =
  | "reserved"
  | "checked_in"
  | "checking_out_today"
  | "checked_out"
  | "cancelled";

export type BookingView = "all" | "active" | "reserved" | "today" | "checked_out" | "cancelled";
export type BookingSort = "created" | "guest" | "status" | "move_in" | "balance";

export type BookingViewCounts = Record<BookingView, number>;

export type BookingsSummaryGuest = {
  id: string;
  guest_name: string;
  expected_arrival_time: string | null;
};

export type BookingsSummary = {
  counts: BookingViewCounts;
  kpis: {
    active: { count: number; in_house: number; leaving: number; arriving: number };
    arrivals_today: { count: number; guests: BookingsSummaryGuest[] };
    departures_today: { count: number; guests: BookingsSummaryGuest[] };
    outstanding: { amount: number; currency: string; bookings: number; mixed_currency: boolean };
  };
  today: string;
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
  hostel?: string;
  view?: BookingView;
  balance?: "due";
  sort?: BookingSort;
  order?: "asc" | "desc";
};

export type BookingsPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};
