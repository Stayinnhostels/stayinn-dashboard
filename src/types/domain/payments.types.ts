/** Figma 08 · Payments. */
export type PaymentsOverview = {
  month: string;
  currency: "pkr" | "usd";
  kpis: {
    collected: { amount: number; rent: number; extras: number };
    still_to_collect: { amount: number; not_paid: number; partly_paid: number };
    net_revenue: { amount: number; refunds: number; kept: number };
    collection_rate: { percent: number | null; fully_paid: number; residents: number };
  };
  chart: { by_day: { day: number; amount: number }[]; total: number; best_day: { day: number; amount: number } | null };
  methods: { method: string; label: string; amount: number; count: number; percent: number }[];
  reminders: { owing_count: number; owing_amount: number; not_paid: number; partly_paid: number; can_email: number; last_sent_at: string | null };
  counts: { residents: number; transactions: number; refunds: number };
};

export type TxKind = "rent" | "extras" | "deposit" | "refund";

export type Transaction = {
  id: string;
  payment_id: string | null;
  source: "payment" | "security";
  booking_id: string;
  booking_code: string | null;
  name: string;
  initials: string;
  room_label: string;
  currency: "pkr" | "usd";
  at: string;
  kind: TxKind;
  direction: "in" | "out";
  for: string;
  method: string | null;
  method_label: string;
  reference: string;
  by: string;
  amount: number;
  refunded_amount: number;
  has_proof: boolean;
};

export type TransactionsResponse = {
  month: string;
  counts: { all: number; in: number; refund: number };
  totals: { money_in: number; refunds: number; net: number };
  received_by: string[];
  methods: { method: string; label: string }[];
  transactions: Transaction[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type TransactionsParams = {
  month?: string;
  currency?: "pkr" | "usd";
  hostel?: string;
  type?: "all" | "in" | "refund";
  method?: string;
  for?: string;
  by?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type DepositsOverview = {
  month: string;
  currency: "pkr" | "usd";
  kpis: {
    held: { amount: number; residents: number };
    to_return_soon: { amount: number; leaving: number };
    returned: { amount: number; residents: number };
    kept: { amount: number; note: string };
  };
  waiting: { booking_id: string; name: string; initials: string; room_label: string; leaves_on: string | null; held: number; owed: number; to_return: number; currency: "pkr" | "usd" }[];
  refunds: {
    id: string;
    payment_id?: string;
    booking_id: string;
    name: string;
    initials: string;
    room_label: string;
    left_on: string | null;
    kind: "deposit_returned" | "deposit_kept" | "rent_refund";
    amount: number;
    at: string;
    note: string;
    reference: string;
    method_label: string;
    for?: string;
    currency: "pkr" | "usd";
  }[];
  month_label: string;
};
