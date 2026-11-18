import type { Booking } from "@/types/domain/booking.types";
import type { ResidentDetail, RentTimelineMonth } from "@/types/domain/resident.types";

export const pad = (n: number) => String(n).padStart(2, "0");
export const monthKeyOf = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const parseKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d || 1, 12);
};
export const monShort = (k: string | null | undefined) => (k ? parseKey(k).toLocaleDateString("en-GB", { month: "short" }) : "");
export const monLong = (k: string | null | undefined) => (k ? parseKey(k).toLocaleDateString("en-GB", { month: "long" }) : "");
export const monthYear = (k: string | null | undefined) => (k ? parseKey(k).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "");
export const dayMon = (k: string | null | undefined) => (k ? parseKey(k.slice(0, 10)).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "");
export const dayMonYear = (k: string | null | undefined) => (k ? parseKey(k.slice(0, 10)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
export const weekdayDate = (k: string | null | undefined) =>
  k ? parseKey(k.slice(0, 10)).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—";
export const isoDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

export type MonthRow = RentTimelineMonth & { collected: number; left: number; extras: number; extrasPaid: number };

/** Rent timeline with collected/left and the month's extras folded in. */
export function monthRows(detail: ResidentDetail): MonthRow[] {
  const extras = detail.extras ?? [];
  return (detail.rent_timeline ?? []).map((m) => {
    const collected = Number(m.collected_amount ?? (m.payment_status === "paid" ? m.rent_amount : 0)) || 0;
    let ex = 0;
    let exPaid = 0;
    for (const e of extras) {
      const row = (e.timeline ?? e.ledger ?? []).find((p) => p.month === m.month);
      if (!row) continue;
      ex += Number(row.amount) || 0;
      exPaid += Number(row.collected_amount ?? (row.payment_status === "paid" ? row.amount : 0)) || 0;
    }
    return { ...m, collected, left: Math.max(0, (Number(m.rent_amount) || 0) - collected), extras: ex, extrasPaid: exPaid };
  });
}

/** The month the profile focuses on: this month while living here, else the last stay month. */
export function focusMonth(detail: ResidentDetail) {
  const now = monthKeyOf();
  const keys = (detail.rent_timeline ?? []).map((m) => m.month);
  if (keys.includes(now)) return now;
  return keys.length ? (keys[keys.length - 1] < now ? keys[keys.length - 1] : keys[0]) : now;
}

/** "Usually pays in the first N days · x of y months on time · prefers JazzCash" from real payments. */
export function payingHabit(booking: Booking) {
  const pays = (booking.payments ?? []).filter((p) => p.paid_at && p.method !== "deposit");
  if (!pays.length) return null;
  const days = pays.map((p) => new Date(p.paid_at as string).getDate()).sort((a, b) => a - b);
  const median = days[Math.floor(days.length / 2)];
  const onTime = pays.filter((p) => new Date(p.paid_at as string).getDate() <= 5).length;
  const counts = new Map<string, number>();
  for (const p of pays) counts.set(p.method_label, (counts.get(p.method_label) ?? 0) + 1);
  const prefers = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return {
    headline: median <= 5 ? `Usually pays in the first ${Math.max(2, median)} days` : `Usually pays around the ${median}${median === 1 ? "st" : median === 2 ? "nd" : median === 3 ? "rd" : "th"}`,
    detail: [`${onTime} of ${pays.length} payment${pays.length === 1 ? "" : "s"} by the 5th`, prefers ? `prefers ${prefers}` : null].filter(Boolean).join(" · "),
    prefers,
    methods: counts.size,
  };
}
