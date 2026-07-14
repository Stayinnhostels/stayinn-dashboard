export type ResidentGender = "male" | "female" | "other" | "";
export type ResidentType = "student" | "employee" | "other" | "";
export type SecurityStatus = "paid" | "returned" | "held" | "not_paid" | "not_applicable";
export type RentPaymentStatus = "paid" | "not_paid" | "returned" | "partial";

export type ResidentRegisterRow = {
  serial_no: number;
  booking_id: string;
  booking_ref: string;
  booking_date: string | null;
  channel: string;
  name: string;
  father_name: string;
  gender: ResidentGender;
  email: string;
  cnic: string;
  contact_number: string;
  guardian_contact: string;
  permanent_address: string;
  room_title: string;
  room_seat: string;
  seat_label: string;
  resident_type: ResidentType;
  check_in: string | null;
  check_out: string | null;
  status: string;
  security_status: SecurityStatus;
  security_amount: number | null;
  payment_status: RentPaymentStatus;
  monthly_rent: number;
  currency: "pkr" | "usd";
  amount_refunded?: number | null;
  amount_retained?: number | null;
};

export type RentTimelineMonth = {
  month: string;
  label: string;
  rent_amount: number;
  payment_status: RentPaymentStatus;
  collected_amount?: number;
};

export type ResidentStaySummary = {
  move_in: string | null;
  check_out: string | null;
  booked_months: number;
  seats_booked: number;
  months_in_stay: number;
  months_living: number;
  months_remaining: number;
  living_since: string | null;
  living_until: string | null;
};

export type ResidentRentSummary = {
  total_months: number;
  paid_months: number;
  partial_months?: number;
  unpaid_months: number;
  returned_months?: number;
  total_rent_due: number;
  total_rent_paid: number;
  total_rent_collected?: number;
  amount_refunded?: number;
  amount_retained?: number;
  security_returned?: number;
  security_retained?: number;
  net_collected?: number;
  currency: "pkr" | "usd";
};

export type ResidentMonthOption = {
  key: string;
  label: string;
};

export type ResidentDetail = {
  resident: ResidentRegisterRow;
  booking: Record<string, unknown>;
  stay: ResidentStaySummary;
  rent_timeline: RentTimelineMonth[];
  rent_summary: ResidentRentSummary;
};

export type ResidentRegisterCohort = "active" | "checkouts";

export type ResidentRegisterParams = {
  month?: string;
  page?: number;
  limit?: number;
  search?: string;
  cohort?: ResidentRegisterCohort;
  status?: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | "active";
};

export type UpdateResidentInput = {
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_father_name?: string;
  guest_gender?: ResidentGender;
  guest_cnic?: string;
  guest_guardian_contact?: string;
  guest_permanent_address?: string;
  /** Channel / company — free text or walk_in / website */
  source?: string;
  seat_label?: string;
  resident_type?: ResidentType;
  security_status?: SecurityStatus;
  security_amount?: number | null;
  month?: string;
  monthly_rent?: number;
  payment_status?: RentPaymentStatus;
  /** Mark the first N stay months as paid (e.g. guest pays 2 months at check-in). */
  collect_rent_months?: number;
};

export const GENDER_LABELS: Record<ResidentGender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  "": "—",
};

export const RESIDENT_TYPE_LABELS: Record<ResidentType, string> = {
  student: "Student",
  employee: "Employee",
  other: "Other",
  "": "—",
};

export const SECURITY_STATUS_LABELS: Record<SecurityStatus, string> = {
  paid: "Paid",
  returned: "Returned",
  held: "Held",
  not_paid: "Not paid",
  not_applicable: "N/A",
};

export const RENT_PAYMENT_STATUS_LABELS: Record<RentPaymentStatus, string> = {
  paid: "Paid",
  not_paid: "Not paid",
  returned: "Returned",
  partial: "Partial",
};
