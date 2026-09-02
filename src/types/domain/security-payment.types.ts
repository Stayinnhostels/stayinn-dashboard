import type { SecurityStatus } from "@/types/domain/resident.types";
import type { SecurityLedgerEntry } from "@/types/domain/booking.types";

export type SecurityPaymentRow = {
  id: string;
  booking_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  payer_name: string;
  room_id: string | null;
  room_title: string | null;
  currency: "pkr" | "usd" | null;
  booking_status: string;
  security_status: SecurityStatus;
  security_amount: number | null;
  security_returned: number;
  security_retained: number;
  security_remaining: number;
  security_ledger: SecurityLedgerEntry[];
  move_in: string | null;
  check_out: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SecurityPaymentsSummaryBucket = {
  remaining: number;
  deposited: number;
  returned: number;
  count: number;
};

export type SecurityPaymentsSummary = {
  pkr: SecurityPaymentsSummaryBucket;
  usd: SecurityPaymentsSummaryBucket;
};

export type SecurityPaymentsListParams = {
  page?: number;
  limit?: number;
  status?: SecurityStatus;
  search?: string;
  hostel?: string;
};

export type SecurityPaymentsPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type SecurityMovementAction = "deposit" | "refund" | "forfeit";

export type RecordSecurityMovementInput = {
  action: SecurityMovementAction;
  amount: number;
  note?: string;
  payer_name?: string;
};
