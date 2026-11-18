import type { RentPaymentStatus } from "@/types/domain/resident.types";

/** GET /residents/roll — Figma 07.01 residents roll. */
export type RollStatusFilter = "all" | "not_paid" | "partial" | "paid" | "returned";
export type RollSort = "not_paid_first" | "name" | "room" | "balance";

export type RollRow = {
  booking_id: string;
  booking_code: string | null;
  name: string;
  initials: string;
  occupation: string;
  email: string;
  phone: string;
  has_email: boolean;
  room_id: string | null;
  room_label: string;
  status: string;
  move_in: string | null;
  check_out: string | null;
  currency: "pkr" | "usd";
  this_month: {
    month: string;
    status: RentPaymentStatus;
    rent: number;
    collected: number;
    left: number;
    deposit_due: number;
    receipt_emailed: boolean;
    paid_ahead_until: string | null;
    leaving_on: string | null;
  };
  history: { month_index: number | null; months_total: number; note: string };
  extras: { due: number; collected: number; labels: string[] };
  last_payment: { at: string | null; method: string; method_label: string; description: string; amount: number } | null;
  balance: number;
  overdue: boolean;
  action: "mark_paid" | "collect" | "receipt" | "view";
  /** Monthly rent grid only (grid=1). */
  cells?: RollCell[];
};

export type RollCell =
  | { month: string; in_stay: false }
  | { month: string; in_stay: true; status: RentPaymentStatus; rent: number; collected: number; left: number };

export type RollMonthTotal = { month: string; state: "closed" | "current" | "upcoming"; expected: number; collected: number; percent: number | null };

export type RollSummary = {
  month: string;
  currency: "pkr" | "usd";
  due: number;
  collected: number;
  outstanding: number;
  percent: number | null;
  paid: { count: number; amount: number };
  partial: { count: number; left: number };
  not_paid: { count: number; amount: number };
  reminder_count: number;
};

export type RollResponse = {
  month: string;
  summary: RollSummary;
  months?: RollMonthTotal[];
  counts: { living: number; moved_out: number };
  rooms: { id: string; label: string }[];
  residents: RollRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type RollParams = {
  month?: string;
  hostel?: string;
  search?: string;
  status?: RollStatusFilter;
  room?: string;
  sort?: RollSort;
  method?: string;
  currency?: "pkr" | "usd";
  grid?: "1";
  page?: number;
  limit?: number;
};

export type MovedOutRow = {
  booking_id: string;
  booking_code: string | null;
  name: string;
  initials: string;
  occupation: string;
  phone: string;
  email: string;
  room_label: string;
  stayed: string;
  stayed_months: number;
  left_on: string | null;
  left_this_month: boolean;
  rent_collected: number;
  rent_owed: number;
  security: { state: "to_return" | "returned" | "kept" | "none"; amount: number; note: string };
  currency: "pkr" | "usd";
};

export type MovedOutResponse = {
  summary: {
    left_this_month: number;
    next_leaving: { name: string; date: string | null } | null;
    deposits_to_return: { amount: number; count: number };
    rent_owed: { amount: number; count: number };
  };
  months: { key: string; label: string }[];
  residents: MovedOutRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type MovedOutParams = { hostel?: string; search?: string; left_in?: string; page?: number; limit?: number };

export type SendRemindersInput = {
  month?: string;
  hostel?: string;
  statuses?: ("not_paid" | "partial" | "paid")[];
  booking_ids?: string[];
  message?: string;
};

/** GET /residents/rooms-board — Figma 07.02 By room. */
export type BoardResident = {
  booking_id: string;
  name: string;
  first_name: string;
  initials: string;
  occupation: string;
  email: string;
  phone: string;
  beds: number[];
  since: string | null;
  leaves_on: string | null;
  leaving_this_month: boolean;
  rent_status: RentPaymentStatus;
  rent: number;
  left: number;
  currency: "pkr" | "usd";
};

export type BoardRoom = {
  id: string;
  room_number: number | null;
  name: string;
  title: string;
  kind: string;
  floor: number | null;
  beds_total: number;
  taken: number;
  bookable: number;
  price_per_bed: number;
  currency: "pkr" | "usd";
  maintenance: { note: string } | null;
  free_since: string | null;
  rent_due: number;
  leaving: number;
  beds: { number: number; label: string; state: "taken" | "free" | "out_of_service"; booking_id: string | null }[];
  residents: BoardResident[];
  state: "full" | "free" | "empty" | "maintenance";
};

export type RoomsBoardResponse = {
  month: string;
  kpis: {
    beds: { taken: number; total: number; percent: number; free: number };
    rooms: { full: number; total: number; with_free: number; empty: number };
    residents: { count: number; leaving: number };
    out_of_service: { count: number; first: string | null };
  };
  rooms: BoardRoom[];
};
