export type BookingStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

export type Booking = {
  id: string;
  room_id: string | null;
  room_title: string | null;
  user_id: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  seats_booked: number;
  months: number;
  move_in: string | null;
  check_out: string | null;
  price_per_seat: number;
  total_amount: number;
  currency?: "pkr" | "usd" | null;
  amount_refunded?: number | null;
  amount_retained?: number | null;
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
