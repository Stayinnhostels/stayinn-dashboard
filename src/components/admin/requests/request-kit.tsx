import { ArrowLeftRight, CalendarDays, UserPlus, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingRequest, BookingRequestStatus, BookingRequestType } from "@/types/domain/booking-request.types";

/** Shared bits for Figma 10 · Guest requests. */

export const TYPE_META: Record<BookingRequestType, { icon: LucideIcon; label: string; short: string; tag: string }> = {
  extend_stay: { icon: CalendarDays, label: "Extend stay", short: "Extend", tag: "Extend stay" },
  cancel: { icon: X, label: "Cancel booking", short: "Cancel", tag: "Cancel booking" },
  room_change: { icon: ArrowLeftRight, label: "Room change", short: "Room", tag: "Room change" },
  additional_seat: { icon: UserPlus, label: "Extra bed", short: "Bed", tag: "Extra bed" },
};

export const STATUS_LABEL: Record<BookingRequestStatus, string> = {
  pending: "Waiting",
  approved: "Approved",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export function initialsOf(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : (p[0]?.[1] ?? ""))).toUpperCase() || "G";
}

const asDate = (key: string) => new Date(key.length === 10 ? `${key}T12:00:00` : key);
/** "30 Nov" */
export const dayMonth = (key?: string | null) => (key ? asDate(key).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—");
/** "Nov 2026" */
export const monthYear = (key?: string | null) => (key ? asDate(key).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—");
export const shortMonth = (key?: string | null) => (key ? asDate(key).toLocaleDateString("en-GB", { month: "short" }) : "—");

/** "2 h ago", "1 day ago", "just now". */
export function ago(iso?: string | null) {
  if (!iso) return "";
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 31) return `${d} day${d === 1 ? "" : "s"} ago`;
  return dayMonth(iso);
}

/** "today, 10:20 AM" / "yesterday, 7:05 AM" / "12 Nov, 9:00 AM". */
export function sentAt(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const today = new Date();
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return `today, ${time}`;
  if (same(d, y)) return `yesterday, ${time}`;
  return `${dayMonth(iso)}, ${time}`;
}

/** Months between two date keys, inclusive-ish ("Apr – Nov 2026"). */
export function spanLabel(from?: string | null, to?: string | null) {
  if (!from || !to) return "";
  const a = asDate(from);
  const b = asDate(to);
  const sameYear = a.getFullYear() === b.getFullYear();
  return `${a.toLocaleDateString("en-GB", { month: "short", ...(sameYear ? {} : { year: "numeric" }) })} – ${b.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`;
}

/** Second line under a request in the list ("30 Nov → 28 Feb · +3 months"). */
export function requestSummary(r: BookingRequest, money: (n: number) => string) {
  const p = r.payload ?? {};
  if (r.type === "extend_stay") {
    const added = p.stay_unit === "night" ? (p.target_nights ?? 0) - (p.current_nights ?? 0) : (p.target_months ?? 0) - (p.current_months ?? 0);
    const unit = p.stay_unit === "night" ? "night" : "month";
    return `${dayMonth(p.current_check_out)} → ${dayMonth(p.requested_check_out)} · +${added} ${unit}${added === 1 ? "" : "s"}`;
  }
  if (r.type === "cancel") {
    const paid = r.paid_total ? ` · ${money(r.paid_total)} paid` : "";
    return r.move_in ? `Arrives ${dayMonth(r.move_in)}${r.booking_status === "checked_in" ? " · living here" : paid}` : "Cancel this booking";
  }
  if (r.type === "room_change") return `To ${p.requested_room_title ?? "another room"}${r.reason ? ` · ${r.reason.slice(0, 28)}` : ""}`;
  return `${p.current_seats ?? r.seats_booked ?? 1} → ${p.target_seats ?? "?"} beds${r.price_per_seat ? ` · +${money((p.additional_seats ?? 1) * r.price_per_seat)}/mo` : ""}`;
}

export function TypeIcon({ type, active, className }: { type: BookingRequestType; active?: boolean; className?: string }) {
  const Icon = TYPE_META[type].icon;
  return (
    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-[10px] transition-colors [&_svg]:size-[18px]", active ? "bg-brand-tint text-brand-text" : "bg-glass-inset text-ink-2", className)}>
      <Icon aria-hidden />
    </span>
  );
}

export function OutlinePill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full border border-ink-2/70 px-2 text-[12px] leading-4 font-medium whitespace-nowrap text-ink-2", className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}

export function TypeTag({ type }: { type: BookingRequestType }) {
  return <span className="inline-flex h-[22px] shrink-0 items-center rounded-full border border-ink-2/70 px-2 text-[12px] leading-4 font-medium whitespace-nowrap text-ink-2">{TYPE_META[type].tag}</span>;
}
