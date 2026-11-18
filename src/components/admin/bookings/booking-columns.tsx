import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Tag } from "@/components/glass";
import { cn } from "@/lib/utils";
import type { Booking, BookingSort } from "@/types/domain/booking.types";
import {
  DISPLAY_STATUS,
  bookingDisplayStatus,
  channelLabel,
  lengthLabel,
  longDate,
  money,
  nextDueLabel,
  occupationLine,
  rentLabel,
  roomLines,
  stayTypeLabel,
} from "./booking-format";

/**
 * The 22 movable columns of the bookings table (Figma 06.03 "Columns" popover).
 * Guest (left) and Balance (right) are always pinned and not listed here.
 */

export type BookingColumnId =
  | "booking_id"
  | "status"
  | "channel"
  | "phone"
  | "guardian"
  | "email"
  | "cnic"
  | "father"
  | "occupation"
  | "room"
  | "seats"
  | "stay_type"
  | "move_in"
  | "move_out"
  | "length"
  | "rent"
  | "security"
  | "paid"
  | "next_due"
  | "address"
  | "notes"
  | "created";

export type BookingColumn = {
  id: BookingColumnId;
  label: string;
  header: string;
  width: number;
  sort?: BookingSort;
  align?: "center";
  cell: (b: Booking) => ReactNode;
};

const text = (v: ReactNode, cls = "text-label font-medium text-ink") => (
  <p className={cn("truncate", cls)}>{v ?? "—"}</p>
);

export const BOOKING_COLUMNS: BookingColumn[] = [
  { id: "booking_id", label: "Booking ID", header: "Booking ID", width: 140, cell: (b) => text(b.booking_code ?? `#${b.id.slice(-8).toUpperCase()}`) },
  {
    id: "status",
    label: "Status",
    header: "Status",
    width: 170,
    sort: "status",
    align: "center",
    cell: (b) => {
      const s = DISPLAY_STATUS[bookingDisplayStatus(b)];
      return (
        <Tag tone={s.tone} showDot>
          {s.label}
        </Tag>
      );
    },
  },
  { id: "channel", label: "Channel", header: "Channel", width: 110, cell: (b) => text(channelLabel(b.source)) },
  { id: "phone", label: "Phone", header: "Phone", width: 150, cell: (b) => text(b.guest_phone || "—") },
  { id: "guardian", label: "Guardian no.", header: "Guardian no.", width: 150, cell: (b) => text(b.guest_guardian_contact || "—") },
  { id: "email", label: "Email", header: "Email", width: 210, cell: (b) => text(b.guest_email?.endsWith("@stayinn.internal") ? "—" : b.guest_email || "—") },
  { id: "cnic", label: "CNIC / B-Form", header: "CNIC / B-Form", width: 160, cell: (b) => text(b.guest_cnic || "—") },
  { id: "father", label: "Father / husband", header: "Father / husband", width: 160, cell: (b) => text(b.guest_father_name || "—") },
  { id: "occupation", label: "Occupation", header: "Occupation", width: 180, cell: (b) => text(occupationLine(b)) },
  {
    id: "room",
    label: "Room · Bed",
    header: "Room · Bed",
    width: 200,
    cell: (b) => {
      const r = roomLines(b);
      return (
        <div className="flex min-w-0 flex-col gap-px text-label">
          <p className="truncate font-medium text-ink">{r.primary}</p>
          {r.secondary ? <p className="truncate text-ink-3">{r.secondary}</p> : null}
        </div>
      );
    },
  },
  { id: "seats", label: "Seats", header: "Seats", width: 80, cell: (b) => text(b.seats_booked) },
  { id: "stay_type", label: "Stay type", header: "Stay type", width: 110, cell: (b) => text(stayTypeLabel(b)) },
  { id: "move_in", label: "Move-in", header: "Move-in", width: 130, sort: "move_in", cell: (b) => text(longDate(b.move_in)) },
  { id: "move_out", label: "Move-out", header: "Move-out", width: 130, cell: (b) => text(b.status === "cancelled" ? "—" : longDate(b.check_out)) },
  { id: "length", label: "Length", header: "Length", width: 100, cell: (b) => text(lengthLabel(b)) },
  { id: "rent", label: "Rent / month", header: "Rent", width: 140, cell: (b) => text(rentLabel(b)) },
  { id: "security", label: "Security", header: "Security", width: 120, cell: (b) => text(money(b, b.security_amount)) },
  { id: "paid", label: "Paid", header: "Paid", width: 124, cell: (b) => text(money(b, b.paid_total), "text-body font-semibold text-ink") },
  {
    id: "next_due",
    label: "Next due",
    header: "Next due",
    width: 180,
    cell: (b) => {
      const n = nextDueLabel(b);
      return text(n.text, cn("text-label font-medium", n.danger ? "text-danger" : "text-ink"));
    },
  },
  { id: "address", label: "Address", header: "Address", width: 220, cell: (b) => text(b.guest_permanent_address || "—") },
  { id: "notes", label: "Notes", header: "Notes", width: 220, cell: (b) => text(b.notes?.split("\n")[0] || "—", "text-label text-ink-2") },
  { id: "created", label: "Created", header: "Created", width: 130, cell: (b) => text(longDate(b.created_at?.slice(0, 10))) },
];

export const COLUMN_BY_ID = new Map(BOOKING_COLUMNS.map((c) => [c.id, c]));
export const ALL_COLUMN_IDS = BOOKING_COLUMNS.map((c) => c.id);

export type ColumnPreset = "front_desk" | "billing" | "everything";

export const COLUMN_PRESETS: Record<ColumnPreset, { label: string; visible: BookingColumnId[] }> = {
  front_desk: { label: "Front desk", visible: ["booking_id", "status", "room", "move_in", "paid"] },
  billing: {
    label: "Billing",
    visible: ["booking_id", "status", "channel", "phone", "room", "stay_type", "move_in", "move_out", "rent", "security", "paid", "next_due", "created"],
  },
  everything: { label: "Everything", visible: ALL_COLUMN_IDS },
};

export type ColumnState = { order: BookingColumnId[]; visible: BookingColumnId[] };

export const DEFAULT_COLUMN_STATE: ColumnState = {
  order: ALL_COLUMN_IDS,
  visible: COLUMN_PRESETS.front_desk.visible,
};

export function presetOf(state: ColumnState): ColumnPreset | null {
  const vis = new Set(state.visible);
  for (const [key, p] of Object.entries(COLUMN_PRESETS) as [ColumnPreset, (typeof COLUMN_PRESETS)[ColumnPreset]][]) {
    if (p.visible.length === vis.size && p.visible.every((id) => vis.has(id))) return key;
  }
  return null;
}

export function visibleColumns(state: ColumnState) {
  const vis = new Set(state.visible);
  return state.order.filter((id) => vis.has(id)).map((id) => COLUMN_BY_ID.get(id)!).filter(Boolean);
}

// ── Per-viewer preferences (localStorage; "remembered per user" in Figma) ──

function readPref<T>(key: string, fallback: T, valid: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw) as unknown;
    return valid(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function writePref(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

function isColumnState(v: unknown): v is ColumnState {
  if (!v || typeof v !== "object") return false;
  const s = v as ColumnState;
  return Array.isArray(s.order) && Array.isArray(s.visible);
}

function sanitize(state: ColumnState): ColumnState {
  const known = new Set<string>(ALL_COLUMN_IDS);
  const order = state.order.filter((id) => known.has(id));
  for (const id of ALL_COLUMN_IDS) if (!order.includes(id)) order.push(id);
  return { order, visible: state.visible.filter((id) => known.has(id)) };
}

export function usePersistentState<T>(key: string, fallback: T, valid: (v: unknown) => v is T) {
  const [value, setValue] = useState<T>(() => readPref(key, fallback, valid));
  useEffect(() => writePref(key, value), [key, value]);
  return [value, setValue] as const;
}

export function useColumnState() {
  const [state, setState] = usePersistentState("stayinn.bookings.columns", DEFAULT_COLUMN_STATE, isColumnState);
  const safe = sanitize(state);
  const set = useCallback((s: ColumnState) => setState(sanitize(s)), [setState]);
  return [safe, set] as const;
}
