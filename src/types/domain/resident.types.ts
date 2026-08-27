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
  company: string;
  institution: string;
  name: string;
  father_name: string;
  gender: ResidentGender;
  email: string;
  cnic: string;
  cnic_image_front: string;
  cnic_image_back: string;
  /** Child registration document — single-image alternative ID used when no CNIC is on file. */
  b_form_image: string;
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
  /** True only for the check-in month — security is a one-time deposit. */
  security_due_this_month?: boolean;
  payment_status: RentPaymentStatus;
  monthly_rent: number;
  extras?: ResidentExtra[];
  extras_due_this_month?: number;
  extras_unpaid_this_month?: number;
  currency: "pkr" | "usd";
  amount_refunded?: number | null;
  amount_retained?: number | null;
};

export type ExtraBillingCycle = "monthly" | "one_time";

export type ResidentExtraPeriod = {
  month: string;
  label?: string;
  amount: number;
  payment_status: RentPaymentStatus;
  collected_amount?: number;
};

export type ResidentExtra = {
  id: string;
  label: string;
  amount: number;
  billing_cycle: ExtraBillingCycle;
  start_month: string | null;
  end_month: string | null;
  status: "active" | "ended";
  ledger?: ResidentExtraPeriod[];
  this_month?: ResidentExtraPeriod | null;
  timeline?: ResidentExtraPeriod[];
  total_due?: number;
  total_collected?: number;
};

export type ResidentExtrasSummary = {
  count: number;
  total_due: number;
  total_collected: number;
  currency: "pkr" | "usd";
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
  extras?: ResidentExtra[];
  extras_summary?: ResidentExtrasSummary;
};

export type ResidentRegisterCohort = "active" | "checkouts";

export type ResidentDirectoryScope = "active" | "past" | "all";

export type ResidentDirectoryRow = ResidentRegisterRow & {
  months_in_stay: number;
  months_living: number;
  months_remaining: number;
  total_rent_due: number;
  total_rent_collected: number;
  has_cnic_images: boolean;
};

export type ResidentDirectoryParams = {
  page?: number;
  limit?: number;
  search?: string;
  scope?: ResidentDirectoryScope;
};

export type ResidentByRoomPerson = {
  booking_id: string;
  booking_ref: string;
  name: string;
  email: string;
  contact_number: string;
  cnic: string;
  seat_label: string;
  seats_booked: number;
  status: string;
  check_in: string | null;
  check_out: string | null;
  resident_type: string;
  channel: string;
  company?: string;
  institution?: string;
};

export type ResidentsByRoomGroup = {
  room_id: string | null;
  room_number: number | null;
  room_title: string;
  category: string;
  status: string;
  beds_total: number;
  beds_available: number;
  occupied_seats: number;
  residents: ResidentByRoomPerson[];
};

export type ResidentsByRoomSummary = {
  total_rooms: number;
  occupied_rooms: number;
  empty_rooms: number;
  total_residents: number;
};

export type ResidentsByRoomParams = {
  search?: string;
  include_empty?: boolean;
};

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
  guest_cnic_image_front?: string;
  guest_cnic_image_back?: string;
  guest_b_form_image?: string;
  guest_guardian_contact?: string;
  guest_permanent_address?: string;
  guest_company?: string;
  guest_institution?: string;
  /** Channel — free text or walk_in / website */
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
  /** Apply monthly_rent to this month and all later months in the stay. */
  apply_rent_forward?: boolean;
  add_extra?: {
    label: string;
    amount: number;
    billing_cycle?: ExtraBillingCycle;
    start_month?: string;
    end_month?: string | null;
  };
  update_extra?: {
    extra_id: string;
    label?: string;
    amount?: number;
    billing_cycle?: ExtraBillingCycle;
    end_month?: string | null;
    status?: "active" | "ended";
    payment_status?: RentPaymentStatus;
    month?: string;
  };
  remove_extra?: string;
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

/** Company for employees, institution for students. */
export function affiliationForResident(r: {
  resident_type?: string | null;
  company?: string | null;
  institution?: string | null;
  guest_company?: string | null;
  guest_institution?: string | null;
}): { label: "Company" | "Institution"; value: string } | null {
  const company = (r.company ?? r.guest_company ?? "").trim();
  const institution = (r.institution ?? r.guest_institution ?? "").trim();
  if (r.resident_type === "student") return { label: "Institution", value: institution };
  if (r.resident_type === "employee") return { label: "Company", value: company };
  if (company) return { label: "Company", value: company };
  if (institution) return { label: "Institution", value: institution };
  return null;
}

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

export const EXTRA_BILLING_CYCLE_LABELS: Record<ExtraBillingCycle, string> = {
  monthly: "Monthly",
  one_time: "One-time",
};

export const DEFAULT_EXTRA_FACILITY_PRESETS = [
  "AC",
  "Cooler",
  "Heater",
  "Fan",
  "Fridge",
  "Parking",
  "Washing machine",
  "Extra mattress",
] as const;

/** @deprecated Use DEFAULT_EXTRA_FACILITY_PRESETS */
export const EXTRA_FACILITY_PRESETS = DEFAULT_EXTRA_FACILITY_PRESETS;
