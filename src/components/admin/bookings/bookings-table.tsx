import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis } from "lucide-react";
import { GlassButton, GlassCheckbox } from "@/components/glass";
import { cn } from "@/lib/utils";
import type { Booking, BookingSort } from "@/types/domain/booking.types";
import type { BookingColumn } from "./booking-columns";
import {
  bookingDisplayStatus,
  dayMonth,
  guestSubtitle,
  guestTitle,
  initials,
  money,
  todayKey,
} from "./booking-format";

/**
 * Figma 06.01–06.03 bookings table. Built like the Figma "Booking row v2": a pinned
 * left block (checkbox + guest, 280), a horizontally scrolling track of the chosen
 * columns, and a pinned right block (balance + menu, 196). Rows are 64px
 * (comfortable) or 48px (compact) so the three blocks line up.
 */

export type TableDensity = "comfortable" | "compact";

type Props = {
  bookings: Booking[];
  columns: BookingColumn[];
  density: TableDensity;
  selected: Set<string>;
  onToggle: (id: string, on: boolean) => void;
  onToggleAll: (on: boolean) => void;
  sort: BookingSort;
  order: "asc" | "desc";
  onSort: (sort: BookingSort) => void;
  onOpen: (b: Booking) => void;
  onCheckIn: (b: Booking) => void;
  renderMenu: (b: Booking, trigger: ReactNode) => ReactNode;
  footer: ReactNode;
};

const HEADER_H = "h-10";

export function BookingsTable({
  bookings,
  columns,
  density,
  selected,
  onToggle,
  onToggleAll,
  sort,
  order,
  onSort,
  onOpen,
  onCheckIn,
  renderMenu,
  footer,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const rowH = density === "compact" ? "h-12" : "h-16";
  const allOn = bookings.length > 0 && bookings.every((b) => selected.has(b.id));
  const someOn = !allOn && bookings.some((b) => selected.has(b.id));
  const trackWidth = columns.reduce((s, c) => s + c.width, 0);

  const rowState = (b: Booking) =>
    cn(
      "border-b border-glass-divider transition-colors",
      selected.has(b.id) ? "bg-brand-tint" : hovered === b.id ? "bg-glass-inset" : "",
    );
  const rowEvents = (b: Booking) => ({
    onMouseEnter: () => setHovered(b.id),
    onMouseLeave: () => setHovered((h) => (h === b.id ? null : h)),
    onClick: () => onOpen(b),
  });

  return (
    <div className="glass-2 overflow-hidden rounded-[20px]">
      <div className="flex">
        {/* Pinned left: checkbox + guest */}
        <div className="w-[220px] shrink-0 sm:w-[280px]" role="rowgroup">
          <div className={cn("flex items-center border-b border-glass-divider bg-glass-inset pl-3", HEADER_H)}>
            <span className="flex w-7 justify-center">
              <GlassCheckbox
                aria-label="Select all bookings on this page"
                checked={allOn}
                indeterminate={someOn}
                onCheckedChange={(on) => onToggleAll(on)}
              />
            </span>
            <SortHeader label="Guest" active={sort === "guest"} order={order} onClick={() => onSort("guest")} />
          </div>
          {bookings.map((b) => (
            <div key={b.id} className={cn("flex cursor-pointer items-center pl-3", rowH, rowState(b))} {...rowEvents(b)}>
              <span className="flex w-7 justify-center">
                <GlassCheckbox
                  aria-label={`Select ${b.guest_name}`}
                  checked={selected.has(b.id)}
                  onCheckedChange={(on) => onToggle(b.id, on)}
                />
              </span>
              <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3">
                <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-tint text-label text-brand-text">
                  {initials(b.guest_name)}
                </span>
                <div className="flex min-w-0 flex-col">
                  <p className="truncate text-body font-semibold text-ink">{guestTitle(b)}</p>
                  {density === "comfortable" ? (
                    <p className="truncate text-label text-ink-3">{guestSubtitle(b)}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scrolling track */}
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div style={{ minWidth: trackWidth }}>
            <div className={cn("flex border-b border-glass-divider bg-glass-inset", HEADER_H)}>
              {columns.map((c) => (
                <div
                  key={c.id}
                  className={cn("flex shrink-0 items-center", c.align === "center" && "justify-center", c.id === columns[columns.length - 1]?.id && "flex-1")}
                  style={{ width: c.width }}
                >
                  {c.sort ? (
                    <SortHeader label={c.header} active={sort === c.sort} order={order} onClick={() => onSort(c.sort!)} />
                  ) : (
                    <span className="px-3 text-eyebrow whitespace-nowrap text-ink-3 uppercase">{c.header}</span>
                  )}
                </div>
              ))}
            </div>
            {bookings.map((b) => (
              <div key={b.id} className={cn("flex cursor-pointer items-center", rowH, rowState(b))} {...rowEvents(b)}>
                {columns.map((c) => (
                  <div
                    key={c.id}
                    className={cn("flex min-w-0 shrink-0 items-center px-3", c.align === "center" && "justify-center", c.id === columns[columns.length - 1]?.id && "flex-1")}
                    style={{ width: c.width }}
                  >
                    {c.cell(b)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Pinned right: balance + menu */}
        <div className="w-[160px] shrink-0 sm:w-[196px]">
          <div className={cn("flex items-center border-b border-glass-divider bg-glass-inset", HEADER_H)}>
            <div className="flex flex-1 items-center">
              <SortHeader label="Balance" active={sort === "balance"} order={order} onClick={() => onSort("balance")} />
            </div>
            <span className="w-14" aria-hidden />
          </div>
          {bookings.map((b) => (
            <div key={b.id} className={cn("flex cursor-pointer items-center", rowH, rowState(b))} {...rowEvents(b)}>
              <div className="flex min-w-0 flex-1 flex-col items-end justify-center gap-px px-3">
                <BalanceCell b={b} compact={density === "compact"} onCheckIn={onCheckIn} />
              </div>
              <div className="flex w-14 justify-center" onClick={(e) => e.stopPropagation()}>
                {renderMenu(
                  b,
                  <button
                    type="button"
                    aria-label={`Actions for ${b.guest_name}`}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 outline-none hover:bg-glass-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border"
                  >
                    <Ellipsis className="size-[18px]" aria-hidden />
                  </button>,
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {footer}
    </div>
  );
}

function SortHeader({
  label,
  active,
  order,
  onClick,
}: {
  label: string;
  active: boolean;
  order: "asc" | "desc";
  onClick: () => void;
}) {
  const Icon = !active ? ArrowUpDown : order === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={`Sort by ${label}`}
      className={cn(
        "flex cursor-pointer items-center gap-1 px-3 text-eyebrow whitespace-nowrap uppercase outline-none focus-visible:ring-2 focus-visible:ring-brand-border",
        active ? "text-ink" : "text-ink-3 hover:text-ink-2",
      )}
    >
      {label}
      <Icon className={cn("size-3", active && "text-brand")} aria-hidden />
    </button>
  );
}

function BalanceCell({
  b,
  compact,
  onCheckIn,
}: {
  b: Booking;
  compact: boolean;
  onCheckIn: (b: Booking) => void;
}) {
  const ds = bookingDisplayStatus(b);
  if (ds === "reserved" && (b.move_in ?? "") <= todayKey()) {
    return (
      <GlassButton
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onCheckIn(b);
        }}
      >
        Check in
      </GlassButton>
    );
  }
  if (b.no_charge) {
    return (
      <>
        <p className="text-body font-semibold text-ink">—</p>
        {!compact ? <p className="text-label text-ink-3">No charge</p> : null}
      </>
    );
  }
  const balance = b.balance_due ?? 0;
  if (balance > 0) {
    return (
      <>
        <p className="text-body font-semibold whitespace-nowrap text-danger">{money(b, balance)}</p>
        {!compact && b.next_due_date ? (
          <p className="text-label whitespace-nowrap text-danger">Due {dayMonth(b.next_due_date)}</p>
        ) : null}
      </>
    );
  }
  return (
    <>
      <p className="text-body font-semibold text-ink">{money(b, 0)}</p>
      {!compact ? (
        <p className={cn("text-label", (b.paid_total ?? 0) > 0 ? "text-success" : "text-ink-3")}>
          {(b.paid_total ?? 0) > 0 ? "Paid" : b.due_on_arrival ? "On arrival" : "Nothing due"}
        </p>
      ) : null}
    </>
  );
}
