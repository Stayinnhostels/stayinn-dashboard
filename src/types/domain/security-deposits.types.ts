/** Figma 09 · Security deposits — GET /api/v1/security/deposits[/:id]. */
export type DepositStatus = "leaving" | "not_paid" | "part_paid" | "held" | "returned" | "kept";
export type DepositTab = "all" | "held" | "not_paid" | "leaving" | "returned" | "kept";
export type DepositScope = "living" | "moved_out" | "all";
export type PayerRelation = "self" | "father" | "mother" | "brother" | "sister" | "guardian" | "spouse" | "company" | "other";

export type DepositRow = {
  booking_id: string;
  booking_code: string | null;
  name: string;
  initials: string;
  phone: string;
  email: string;
  gender: "male" | "female" | "other" | "";
  room_label: string;
  stay_label: string;
  living: boolean;
  move_in: string | null;
  check_out: string | null;
  left_on: string | null;
  currency: "pkr" | "usd";
  payer: { name: string; relation: PayerRelation; phone: string; label: string; self: boolean };
  status: DepositStatus;
  required: number;
  deposited: number;
  returned: number;
  kept: number;
  held: number;
  to_return: number;
  after_deductions: boolean;
  planned_return: number;
  planned_set: boolean;
  owed: number;
  left_to_collect: number;
  settled_at: string | null;
};

export type DepositsResponse = {
  currency: "pkr" | "usd";
  kpis: {
    held: { amount: number; residents: number; standard: number };
    planned_return: { amount: number; expected_deductions: number };
    returned_year: { amount: number; residents: number; this_month: number };
    kept_year: { amount: number; note: string };
  };
  leaving_soon: { by: string; to_return: number; rows: DepositRow[] };
  not_collected: { rows: DepositRow[]; amount: number };
  counts: Record<DepositTab, number>;
  deposits: DepositRow[];
  totals: { deposited: number; returned: number; held: number };
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type DepositsParams = {
  hostel?: string;
  currency?: "pkr" | "usd";
  tab?: DepositTab;
  scope?: DepositScope;
  search?: string;
  page?: number;
  limit?: number;
};

export type DepositDeduction = {
  key: string;
  kind: "rent" | "extra" | "info";
  month: string;
  extra_id?: string;
  label: string;
  sub: string;
  amount: number;
  selected: boolean;
};

export type DepositHistoryItem = {
  id: string;
  entry_id?: string;
  type: "requested" | "deposit" | "refund" | "kept" | "adjustment" | "plan" | "reminder";
  title: string;
  detail: string;
  actor: string;
  at: string;
  balance: number | null;
};

export type DepositDocument = {
  id: string;
  entry_id?: string;
  source: "receipt" | "upload";
  kind: "receipt" | "photos" | "damage" | "other";
  name: string;
  at: string | null;
  size: number | null;
  mime?: string;
  note: string;
};

export type DepositDetail = {
  deposit: DepositRow;
  held_since: string | null;
  guardian: { name: string; phone: string };
  deductions: DepositDeduction[];
  history: DepositHistoryItem[];
  documents: DepositDocument[];
};

export type DepositMethod = "cash" | "jazzcash" | "easypaisa" | "bank_transfer" | "card";

export type ReturnDepositInput = {
  amount: number;
  deductions: (
    | { kind: "rent"; month: string; amount: number; label?: string }
    | { kind: "extra"; extra_id: string; month: string; amount: number; label?: string }
    | { kind: "charge"; label: string; amount: number; reason?: "damage" | "other"; photo?: string; photo_name?: string }
  )[];
  method?: DepositMethod;
  give_to_name?: string;
  give_to_phone?: string;
  date?: string;
  note?: string;
  email_receipt?: boolean;
};

export type CollectDepositInput = {
  amount: number;
  required?: number;
  method: DepositMethod;
  date?: string;
  note?: string;
  payer_name?: string;
  payer_relation?: PayerRelation;
  payer_phone?: string;
};
