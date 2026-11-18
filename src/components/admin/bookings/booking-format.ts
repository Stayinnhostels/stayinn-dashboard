import { formatMoney } from "@/lib/payments";
import type { Booking, BookingDisplayStatus } from "@/types/domain/booking.types";

/** Formatting shared by the Bookings table and cards (Figma 06). */

export const DISPLAY_STATUS: Record<
  BookingDisplayStatus,
  { label: string; tone: "brand" | "success" | "warning" | "neutral" | "danger" }
> = {
  reserved: { label: "Reserved", tone: "brand" },
  checked_in: { label: "Checked in", tone: "success" },
  checking_out_today: { label: "Checking out today", tone: "warning" },
  checked_out: { label: "Checked out", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export function bookingDisplayStatus(b: Booking): BookingDisplayStatus {
  if (b.display_status) return b.display_status;
  if (b.status === "checked_in") return "checked_in";
  if (b.status === "checked_out") return "checked_out";
  if (b.status === "cancelled") return "cancelled";
  return "reserved";
}

export function parseKey(key: string | null | undefined): Date | null {
  if (!key) return null;
  const [y, m, d] = key.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12);
}

/** "Mon 9 Nov 2026" */
export function longDate(key: string | null | undefined) {
  const d = parseKey(key);
  if (!d) return "—";
  return `${d.toLocaleDateString("en-GB", { weekday: "short" })} ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })} ${d.getFullYear()}`;
}

/** "Mon 9 Nov" */
export function shortDayDate(key: string | null | undefined) {
  const d = parseKey(key);
  if (!d) return "—";
  return `${d.toLocaleDateString("en-GB", { weekday: "short" })} ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })}`;
}

/** "9 Nov" */
export function dayMonth(key: string | null | undefined) {
  const d = parseKey(key);
  if (!d) return "—";
  return `${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })}`;
}

export function daysBetween(a: string | null | undefined, b: string | null | undefined) {
  const x = parseKey(a);
  const y = parseKey(b);
  if (!x || !y) return 0;
  return Math.round((y.getTime() - x.getTime()) / 86_400_000);
}

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export function residentTypeLabel(b: Booking) {
  return b.resident_type ? cap(b.resident_type) : "";
}

/** "Male · Employee" under the guest name. */
export function guestSubtitle(b: Booking) {
  return [b.guest_gender ? cap(b.guest_gender) : "", residentTypeLabel(b)].filter(Boolean).join(" · ") || "—";
}

/** "Employee · Systems Ltd" on cards. */
export function occupationLine(b: Booking) {
  const org = b.resident_type === "student" ? b.guest_institution : b.guest_company;
  return [residentTypeLabel(b), org].filter(Boolean).join(" · ") || "—";
}

/** "Alex Rivera +1" when the booking covers more than one seat. */
export function guestTitle(b: Booking) {
  return b.seats_booked > 1 ? `${b.guest_name} +${b.seats_booked - 1}` : b.guest_name;
}

function roomName(b: Booking) {
  return b.room_name ?? b.room_title?.replace(/^\d+\s·\s/, "") ?? "";
}

/** Table room cell: "Room 1 · Bed 5" / "6-bed dorm · Floor 1". */
export function roomLines(b: Booking) {
  const num = b.room_number != null ? `Room ${b.room_number}` : (b.room_title ?? "—");
  const bed = b.seat_label ? (/^bed/i.test(b.seat_label) ? b.seat_label : `Bed ${b.seat_label}`) : null;
  const floor = b.room_floor != null ? `Floor ${b.room_floor}` : null;
  if (bed) {
    return { primary: `${num} · ${bed}`, secondary: [roomName(b), floor].filter(Boolean).join(" · ") };
  }
  return { primary: [num, roomName(b)].filter(Boolean).join(" · "), secondary: floor ?? "" };
}

/** Card room line: "Room 1 · Bed 5 · 6-bed dorm" / "Room 15 · Private single · Floor 1". */
export function roomCardLine(b: Booking) {
  const num = b.room_number != null ? `Room ${b.room_number}` : (b.room_title ?? "—");
  const bed = b.seat_label ? (/^bed/i.test(b.seat_label) ? b.seat_label : `Bed ${b.seat_label}`) : null;
  const floor = !bed && b.room_floor != null ? `Floor ${b.room_floor}` : null;
  return [num, bed, roomName(b), floor].filter(Boolean).join(" · ");
}

export function money(b: Booking, amount: number | null | undefined) {
  return formatMoney(Number(amount) || 0, b.currency ?? "pkr");
}

export function rentLabel(b: Booking) {
  if (b.rent_amount == null) return "—";
  return b.rent_unit === "night" ? `${money(b, b.rent_amount)} / night` : money(b, b.rent_amount);
}

/** Card stay line: "Mon 9 Nov → Wed 9 Dec · 30 nights" with a status-specific tail. */
export function stayLine(b: Booking) {
  const ds = bookingDisplayStatus(b);
  const from = shortDayDate(b.move_in);
  const to = ds === "cancelled" ? "—" : shortDayDate(b.check_out);
  const today = todayKey();
  let tail = "";
  if (ds === "cancelled") tail = "cancelled";
  else if (ds === "checking_out_today") tail = "leaves 11:00";
  else if (ds === "reserved") tail = b.expected_arrival_time ? `arrives ${b.expected_arrival_time}` : "arriving";
  else if (ds === "checked_in") {
    const left = daysBetween(today, b.check_out);
    tail = left > 0 && left < 30 ? `${left} left` : `${daysBetween(b.move_in, b.check_out)} nights`;
  } else tail = `${daysBetween(b.move_in, b.check_out)} nights`;
  return `${from} → ${to} · ${tail}`;
}

/** Progress through the stay, 0–1 (card bar). */
export function stayProgress(b: Booking) {
  const total = daysBetween(b.move_in, b.check_out);
  if (total <= 0) return 0;
  const done = daysBetween(b.move_in, todayKey());
  return Math.min(1, Math.max(0, done / total));
}

/** "Next due" text + whether it is red. */
export function nextDueLabel(b: Booking): { text: string; danger: boolean } {
  if (b.no_charge || !b.next_due_date) return { text: "—", danger: false };
  const amount = money(b, b.next_due_amount);
  if (b.overdue) return { text: `Overdue ${dayMonth(b.next_due_date)} · ${amount}`, danger: true };
  if (b.due_on_arrival) return { text: `On arrival · ${amount}`, danger: false };
  return { text: `${dayMonth(b.next_due_date)} · ${amount}`, danger: false };
}

export function channelLabel(source: string | null | undefined) {
  switch (source) {
    case "walk_in":
      return "Walk-in";
    case "website":
      return "Website";
    case "phone":
      return "Phone";
    default:
      return source ? cap(source.replace(/_/g, " ")) : "—";
  }
}

export function stayTypeLabel(b: Booking) {
  return b.stay_unit === "night" ? "Nightly" : "Monthly";
}

export function lengthLabel(b: Booking) {
  if (b.stay_unit === "night") {
    const n = b.nights ?? daysBetween(b.move_in, b.check_out);
    return `${n} night${n === 1 ? "" : "s"}`;
  }
  return `${b.months} month${b.months === 1 ? "" : "s"}`;
}
