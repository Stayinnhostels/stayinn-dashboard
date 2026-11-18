import type { Room } from "./room.types";

/** GET /rooms/:id/beds — Figma 05 room detail (beds, guests, occupancy). */

export type BedStatus = "occupied" | "reserved" | "checking_out" | "free" | "out_of_service";
export type GuestPaymentState = "paid" | "partial" | "unpaid" | "reserved";

export type BedBooking = {
  id: string;
  booking_code: string | null;
  guest_name: string;
  guest_phone: string | null;
  seats_booked: number;
  beds: number[];
  bed_label: string;
  status: "pending" | "confirmed" | "checked_in";
  move_in: string | null;
  check_out: string | null;
  check_in_time: string;
  check_out_time: string;
  expected_arrival_time: string | null;
  checked_in_at: string | null;
  source: string | null;
  payment_state: GuestPaymentState;
  id_pending: boolean;
};

export type Bed = {
  number: number;
  label: string;
  status: BedStatus;
  free_from: string | null;
  overdue: boolean;
  assumed: boolean;
  booking: BedBooking | null;
  next_booking: BedBooking | null;
};

export type RoomBedsSummary = {
  occupied: number;
  reserved: number;
  checking_out: number;
  free: number;
  out_of_service: number;
  total: number;
  taken: number;
  bookable: number;
};

export type RoomBeds = {
  room_id: string;
  kind: "dorm" | "private";
  today: string;
  check_in_time: string;
  check_out_time: string;
  gender_policy: "mixed" | "male" | "female";
  housekeeping_status: "ready" | "needs_cleaning";
  last_cleaned_at: string | null;
  beds: Bed[];
  summary: RoomBedsSummary;
  guests: BedBooking[];
  current_booking: BedBooking | null;
  leaving_today: { bed: string; guest_name: string | null; time: string }[];
  next_free: { bed: number; label: string; date: string; time: string } | null;
  stats: { avg_stay_nights: number | null; month_occupancy_pct: number };
};

export type RoomAvailability = {
  room: Room;
  kind: "dorm" | "private";
  free_now: number;
  frees_today: number;
  frees_at: string | null;
  free_beds: number[];
  leaving_beds: number[];
  housekeeping_status: "ready" | "needs_cleaning";
  summary: RoomBedsSummary;
};

export type BedTakenDetails = {
  beds: number[];
  holder: { guest_name: string; booking_id: string } | null;
  alternatives: {
    room_id: string;
    title: string;
    room_number: number | null;
    kind: "dorm" | "private";
    free_now: number;
    frees_today: number;
    frees_at: string | null;
    free_beds: number[];
    price_per_night_usd: number | null;
    price_per_night_pkr: number | null;
  }[];
};

export type ReturningGuest = {
  booking_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_gender: string;
  id_type: "cnic" | "b_form" | "passport" | "";
  guest_cnic: string;
  guest_passport: string;
  guest_guardian_name: string;
  guest_guardian_contact: string;
  has_id_images: boolean;
  last_stay: string | null;
};
