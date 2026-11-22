export type BookingRequestType = "cancel" | "room_change" | "additional_seat" | "extend_stay";
export type BookingRequestStatus = "pending" | "approved" | "rejected" | "withdrawn";

export type BookingRequest = {
  id: string;
  booking_id: string;
  user_id: string;
  type: BookingRequestType;
  type_label: string;
  status: BookingRequestStatus;
  reason: string;
  payload: {
    requested_room_id?: string;
    requested_room_title?: string;
    additional_seats?: number;
    current_seats?: number;
    target_seats?: number;
    requested_check_out?: string;
    current_check_out?: string;
    current_months?: number;
    target_months?: number;
    current_nights?: number;
    target_nights?: number;
    stay_unit?: "month" | "night";
  };
  admin_note: string;
  amount_refunded: number | null;
  resolved_at: string | null;
  created_at: string | null;
  booking_ref?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  booking_status?: string | null;
  seats_booked?: number | null;
  room_title?: string | null;
  /** Figma 10 · Guest requests additions. */
  booking_code?: string | null;
  seat_label?: string | null;
  room_number?: number | null;
  move_in?: string | null;
  check_out?: string | null;
  price_per_seat?: number | null;
  currency?: string;
  extra_amount?: number;
  /** Paid so far on the booking (cancel requests). */
  paid_total?: number | null;
  reply_template?: string | null;
  refund_method?: RefundMethod | null;
  resolved_by_name?: string | null;
  reply_emailed_at?: string | null;
};

export type RefundMethod = "cash" | "jazzcash" | "easypaisa" | "bank";

export type BookingRequestCounts = {
  status: Record<BookingRequestStatus | "all", number>;
  type: Record<BookingRequestType | "all", number>;
};

export type BookingRequestKpis = {
  oldest_pending_at: string | null;
  approved_this_month: number;
  extension_rent_this_month: number;
  currency: string;
  rejected_this_month: number;
  top_reject_reason: string | null;
  avg_reply_hours: number | null;
};

export type BookingRequestImpact = {
  stay?: { move_in: string | null; check_out: string | null; months: number | null; nights: number | null; stay_unit: "month" | "night" };
  extend?: {
    from: string;
    to: string;
    bed_free: boolean;
    bed_holder: string | null;
    bed_checked: boolean;
    added_units: number;
    unit: "month" | "night";
    monthly_rent: number;
    extra_amount: number;
    added_months: string[];
  };
  cancel?: {
    paid: number;
    days_before_arrival: number | null;
    arrived: boolean;
    policy: string;
    policy_text: string;
    share: number;
    allows_label: string;
    amount: number;
    frees_from: string | null;
    frees_to: string | null;
  };
  room_change?: { room_title: string; beds_available: number; enough_beds: boolean; status: string | null; current_rent: number } | null;
  additional_seat?: { beds_available: number; enough_beds: boolean; added_seats: number; extra_rent: number };
};

export type BookingRequestListParams = {
  status?: BookingRequestStatus;
  type?: BookingRequestType;
  search?: string;
  limit?: number;
  page?: number;
  hostel?: string;
};

export type BookingRequestStats = {
  pending: number;
  total: number;
};
