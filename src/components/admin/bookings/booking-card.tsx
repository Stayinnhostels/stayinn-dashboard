import type { ReactNode } from "react";
import { Ellipsis } from "lucide-react";
import { GlassButton, GlassCheckbox, Tag } from "@/components/glass";
import { RoomThumbnail } from "@/components/admin/room-thumbnail";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/domain/booking.types";
import {
  DISPLAY_STATUS,
  bookingDisplayStatus,
  channelLabel,
  guestTitle,
  initials,
  money,
  nextDueLabel,
  occupationLine,
  rentLabel,
  roomCardLine,
  stayLine,
  stayProgress,
  todayKey,
} from "./booking-format";

export type BookingCardAction = "collect" | "record_payment" | "check_in" | "check_out" | "rebook";

/** Which footer button a booking gets (Figma 06.04 "Booking card v2"). */
export function cardPrimaryAction(b: Booking): { action: BookingCardAction; label: string; primary: boolean } {
  const ds = bookingDisplayStatus(b);
  if (ds === "cancelled" || ds === "checked_out") return { action: "rebook", label: "Rebook", primary: false };
  if (ds === "reserved") return { action: "check_in", label: "Check in", primary: true };
  if (ds === "checking_out_today") return { action: "check_out", label: "Check out", primary: true };
  if ((b.balance_due ?? 0) > 0) {
    return { action: "collect", label: `Collect ${money(b, b.balance_due)}`, primary: true };
  }
  return { action: "record_payment", label: "Record payment", primary: false };
}

function Kv({ label, value, danger }: { label: string; value: ReactNode; danger?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 font-medium">
      <p className="text-label whitespace-nowrap text-ink-3">{label}</p>
      <p className={cn("truncate text-body", danger ? "text-danger" : "text-ink")}>{value}</p>
    </div>
  );
}

export function BookingCard({
  booking: b,
  selected,
  selecting,
  onToggle,
  onOpen,
  onAction,
  renderMenu,
}: {
  booking: Booking;
  selected: boolean;
  /** Any card selected → show every checkbox. */
  selecting: boolean;
  onToggle: (on: boolean) => void;
  onOpen: () => void;
  onAction: (action: BookingCardAction) => void;
  renderMenu: (trigger: ReactNode) => ReactNode;
}) {
  const ds = bookingDisplayStatus(b);
  const status = DISPLAY_STATUS[ds];
  const next = nextDueLabel(b);
  const primary = cardPrimaryAction(b);
  const balance = b.balance_due ?? 0;
  const badges = [
    b.returning_guest ? { label: "Returning guest", tone: "brand" as const } : null,
    b.id_pending ? { label: "ID pending", tone: "warning" as const } : null,
    b.overdue ? { label: "Overdue", tone: "danger" as const } : null,
  ].filter(Boolean) as { label: string; tone: "brand" | "warning" | "danger" }[];

  return (
    <article
      onClick={onOpen}
      className={cn(
        "group glass-1 flex cursor-pointer flex-col gap-3 rounded-[20px] p-4 transition-colors",
        selected && "border-brand-border bg-brand-tint",
      )}
    >
      {badges.length ? (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((x) => (
            <Tag key={x.label} tone={x.tone} showDot>
              {x.label}
            </Tag>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-2.5">
        <GlassCheckbox
          aria-label={`Select ${b.guest_name}`}
          checked={selected}
          onCheckedChange={onToggle}
          className={cn(!selecting && !selected && "hidden group-hover:flex group-focus-within:flex")}
        />
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-tint text-label font-medium text-brand-text">
          {initials(b.guest_name)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-body font-semibold text-ink">{guestTitle(b)}</p>
          <p className="truncate text-label font-medium text-ink-3">
            {b.booking_code ?? `#${b.id.slice(-8).toUpperCase()}`}
          </p>
        </div>
        <Tag tone={status.tone} showDot>
          {status.label}
        </Tag>
      </div>

      <div className="flex flex-col gap-2 rounded-[14px] border border-glass-divider bg-glass-inset p-2.5">
        <div className="flex items-center gap-2.5">
          <span className="size-12 shrink-0 overflow-hidden rounded-[10px]">
            <RoomThumbnail src={b.room_image ?? null} iconClassName="size-5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col text-label">
            <p className="truncate font-medium text-ink">{roomCardLine(b)}</p>
            <p className="truncate text-ink-2">{stayLine(b)}</p>
          </div>
        </div>
        <div className="h-1 overflow-hidden rounded-[4px] bg-glass-divider">
          <div
            className="h-1 rounded-[4px] bg-brand"
            style={{ width: `${Math.max(3, Math.round(stayProgress(b) * 100))}%` }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Kv label="Phone" value={b.guest_phone || "—"} />
        <Kv label="Guardian" value={b.guest_guardian_contact || "—"} />
      </div>
      <div className="flex gap-3">
        <Kv label="Occupation" value={occupationLine(b)} />
        <Kv label="Channel" value={channelLabel(b.source)} />
      </div>
      <div className="flex gap-3">
        <Kv label={b.rent_unit === "night" ? "Rent / night" : "Rent / month"} value={rentLabel(b).replace(" / night", "")} />
        <Kv label="Security" value={money(b, b.security_amount)} />
      </div>
      <div className="flex gap-3">
        <Kv label="Paid" value={money(b, b.paid_total)} />
        <Kv label="Next due" value={next.text} danger={next.danger} />
      </div>

      <div className="mt-auto h-px bg-glass-divider" />

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-label text-ink-3">{b.no_charge ? "No charge" : balance > 0 ? "Balance due" : "Balance"}</p>
          <p className={cn("text-hero whitespace-nowrap", balance > 0 ? "text-danger" : "text-ink")}>
            {b.no_charge ? "—" : money(b, balance)}
          </p>
        </div>
        {ds === "reserved" && (b.move_in ?? "") > todayKey() ? null : (
          <GlassButton
            size="sm"
            variant={primary.primary ? "primary" : "glass"}
            onClick={() => onAction(primary.action)}
          >
            {primary.label}
          </GlassButton>
        )}
        {renderMenu(
          <button
            type="button"
            aria-label={`Actions for ${b.guest_name}`}
            className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] bg-glass-inset text-ink-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border"
          >
            <Ellipsis className="size-4" aria-hidden />
          </button>,
        )}
      </div>
      <p className="text-right text-label font-medium text-brand-text">Open full record →</p>
    </article>
  );
}
