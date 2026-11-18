import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeftRight, BedSingle, ChevronRight, Eye, LogOut, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, Tag } from "@/components/glass";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BookingRefundDialog, type CheckoutConfirmExtras } from "@/components/admin/booking-refund-dialog";
import { useBookingQuery, useUpdateBookingDetailsMutation, useUpdateBookingStatusMutation } from "@/queries/bookings";
import { ApiError } from "@/api/apiFetch";
import { cn } from "@/lib/utils";
import type { Bed, BedBooking, GuestPaymentState } from "@/types/domain/room-beds.types";

/** Figma 05 room detail pieces: bed tiles, bed popover, guest rows, occupancy ring. */

const parseKey = (k: string | null | undefined) => {
  if (!k) return null;
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
};
export const dayMonth = (k: string | null | undefined) => {
  const d = parseKey(k);
  return d ? `${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })}` : "—";
};
export const weekdayDayMonth = (k: string | null | undefined) => {
  const d = parseKey(k);
  return d ? `${d.toLocaleDateString("en-GB", { weekday: "short" })}, ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "short" })}` : "—";
};
export const shortName = (n: string) => {
  const p = n.trim().split(/\s+/);
  return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0];
};
export const initials = (n: string) => {
  const p = n.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "?";
};
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const PAYMENT_TAG: Record<GuestPaymentState, { tone: "success" | "warning" | "danger" | "brand"; label: string }> = {
  paid: { tone: "success", label: "Paid" },
  partial: { tone: "warning", label: "Partial" },
  unpaid: { tone: "danger", label: "Unpaid" },
  reserved: { tone: "brand", label: "Reserved" },
};

const STATE_LABEL: Record<Bed["status"], string> = {
  occupied: "Occupied",
  reserved: "Reserved",
  checking_out: "Checking out",
  free: "Free",
  out_of_service: "Out of service",
};

function bedLines(bed: Bed) {
  const b = bed.booking;
  switch (bed.status) {
    case "occupied":
      return [b ? shortName(b.guest_name) : "—", bed.overdue ? `overdue since ${dayMonth(b?.check_out)}` : `until ${dayMonth(b?.check_out)}`];
    case "reserved":
      return [
        b ? shortName(b.guest_name) : "—",
        b?.move_in === todayKey() ? `arrives today ${b.expected_arrival_time ?? b.check_in_time}` : `arrives ${dayMonth(b?.move_in)}`,
      ];
    case "checking_out":
      return [b ? shortName(b.guest_name) : "—", `leaves ${bed.free_from} · free after`];
    case "free":
      return ["Free now", bed.next_booking ? `reserved from ${dayMonth(bed.next_booking.move_in)}` : "Ready for a walk-in"];
    default:
      return ["Not bookable", "Out of service"];
  }
}

/** Figma "Bed tile" on the room page. Occupied/reserved open the bed popover. */
export function BedTile({
  bed,
  onAssign,
  popover,
}: {
  bed: Bed;
  onAssign: () => void;
  popover?: ReactNode;
}) {
  const [l1, l2] = bedLines(bed);
  const tinted =
    bed.status === "reserved"
      ? "border-[1.2px] border-brand-text bg-brand-tint"
      : bed.status === "checking_out"
        ? "border-[1.2px] border-warning bg-warning-tint"
        : bed.status === "free"
          ? "border-[1.2px] border-success bg-success-tint"
          : bed.status === "out_of_service"
            ? "glass-2 opacity-60"
            : "glass-2";
  const dot =
    bed.status === "checking_out"
      ? "bg-warning"
      : bed.status === "free"
        ? "bg-success"
        : bed.status === "reserved"
          ? "bg-brand-text"
          : bed.status === "out_of_service"
            ? "bg-ink-3"
            : "bg-brand";
  const stateText =
    bed.status === "checking_out" ? "text-warning" : bed.status === "reserved" ? "text-brand-text" : bed.status === "free" ? "text-success" : "text-ink-2";
  const body = (
    <>
      <span className="flex w-full items-center justify-between">
        <span className="flex size-[30px] items-center justify-center rounded-[9px] bg-glass-inset text-ink [&_svg]:size-4">
          <BedSingle aria-hidden />
        </span>
        <span className={cn("flex items-center gap-1 rounded-full bg-glass-inset px-[7px] py-0.5 text-label", stateText)}>
          <span className={cn("size-1.5 rounded-full", dot)} aria-hidden />
          {bed.overdue ? "Overdue" : STATE_LABEL[bed.status]}
        </span>
      </span>
      <span className="text-hero text-ink">{bed.label}</span>
      <span className="text-body font-medium text-ink">{l1}</span>
      <span className="text-label font-medium text-ink-2">{l2}</span>
      <span className="flex-1" />
    </>
  );
  const cls = cn("relative flex h-[184px] w-full flex-col items-start gap-1.5 rounded-[18px] p-3.5 text-left", tinted);
  const assign =
    bed.status === "free" || bed.status === "checking_out" ? (
      <button
        type="button"
        onClick={onAssign}
        className="flex h-[30px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-glass-inset px-2.5 text-label font-medium text-ink outline-none hover:bg-glass-2 focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-3.5"
      >
        <UserPlus aria-hidden /> Assign
      </button>
    ) : null;

  if (popover && bed.booking && (bed.status === "occupied" || bed.status === "reserved" || bed.status === "checking_out")) {
    return (
      <Popover>
        <div className={cls}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`${bed.label} · ${bed.booking.guest_name}`}
              className="absolute inset-0 cursor-pointer rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-brand-border"
            />
          </PopoverTrigger>
          <div className="pointer-events-none flex size-full flex-col items-start gap-1.5">{body}</div>
          {assign ? <div className="relative w-full">{assign}</div> : null}
        </div>
        {popover}
      </Popover>
    );
  }
  return (
    <div className={cls}>
      {body}
      {assign}
    </div>
  );
}

/** Figma 05.07 "Popover / Bed 1". */
export function BedPopover({
  booking,
  roomLabel,
  onMove,
  onCheckout,
}: {
  booking: BedBooking;
  roomLabel: string;
  onMove: () => void;
  onCheckout: () => void;
}) {
  const pay = PAYMENT_TAG[booking.payment_state];
  const row =
    "flex h-11 w-full cursor-pointer items-center gap-3 rounded-[12px] px-3 text-body font-medium text-ink-2 outline-none hover:bg-glass-inset hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-[18px]";
  return (
    <PopoverContent
      align="start"
      sideOffset={8}
      className="glass-3 flex w-[300px] flex-col gap-3 rounded-[20px] border-glass-stroke p-4 font-geist text-ink shadow-none"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-label font-medium text-brand-text">
          {initials(booking.guest_name)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-body font-semibold text-ink">{booking.guest_name}</p>
          <p className="truncate text-label text-ink-2">
            {booking.bed_label} · {roomLabel}
          </p>
        </div>
        <Tag tone={pay.tone} showDot>
          {pay.label}
        </Tag>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          ["Check-in", weekdayDayMonth(booking.move_in)],
          ["Check-out", weekdayDayMonth(booking.check_out)],
        ].map(([l, v]) => (
          <div key={l} className="flex flex-col gap-0.5 rounded-[12px] border border-glass-divider bg-glass-inset px-3 py-2">
            <span className="text-label text-ink-2">{l}</span>
            <span className="text-body font-semibold text-ink">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col">
        <Link to="/admin/bookings/$id" params={{ id: booking.id }} className={row}>
          <Eye aria-hidden /> View booking
        </Link>
        <button type="button" className={row} onClick={onMove}>
          <ArrowLeftRight aria-hidden /> Move bed
        </button>
        {booking.status === "checked_in" ? (
          <button type="button" className={row} onClick={onCheckout}>
            <LogOut aria-hidden /> Check out
          </button>
        ) : null}
      </div>
      <p className="text-label text-ink-2">ID &amp; documents are in the booking</p>
    </PopoverContent>
  );
}

/** "Move bed": pick free beds for the booking (PATCH seat_label, conflict-checked on the API). */
export function MoveBedDialog({
  open,
  onOpenChange,
  booking,
  beds,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  booking: BedBooking | null;
  beds: Bed[];
}) {
  const update = useUpdateBookingDetailsMutation();
  const [picked, setPicked] = useState<number[]>([]);
  const need = booking?.seats_booked ?? 1;
  const options = beds.filter((b) => b.status === "free" || booking?.beds.includes(b.number));
  function save() {
    if (!booking) return;
    update.mutate(
      { id: booking.id, input: { seat_label: picked.map((n) => `Bed ${n}`).join(", ") } },
      {
        onSuccess: () => {
          toast.success(`${booking.guest_name} moved to ${picked.map((n) => `Bed ${n}`).join(", ")}`);
          onOpenChange(false);
        },
        onError: (e) => toast.error(e instanceof ApiError || e instanceof Error ? e.message : "Could not move bed"),
      },
    );
  }
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (o) setPicked([]);
        onOpenChange(o);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim" />
        <Dialog.Content
          aria-describedby={undefined}
          className="glass-3 fixed top-1/2 left-1/2 z-50 flex w-[min(440px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-[24px] p-6 font-geist text-ink outline-none"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <Dialog.Title className="text-card-title text-ink">Move {booking?.guest_name}</Dialog.Title>
              <p className="text-body text-ink-2">
                Now on {booking?.bed_label}. Pick {need} free bed{need === 1 ? "" : "s"}.
              </p>
            </div>
            <Dialog.Close aria-label="Close" className="cursor-pointer rounded-md p-1 text-ink-2 hover:text-ink">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {options.map((b) => {
              const on = picked.includes(b.number);
              const current = booking?.beds.includes(b.number);
              return (
                <button
                  key={b.number}
                  type="button"
                  aria-pressed={on}
                  disabled={current}
                  onClick={() =>
                    setPicked((p) => (on ? p.filter((n) => n !== b.number) : p.length >= need ? [...p.slice(1), b.number] : [...p, b.number]))
                  }
                  className={cn(
                    "flex h-16 cursor-pointer flex-col items-center justify-center rounded-[14px] border text-body font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand-border disabled:cursor-default",
                    on ? "border-2 border-brand bg-brand-tint text-ink" : current ? "border-glass-divider bg-glass-inset text-ink-3" : "glass-2 text-ink",
                  )}
                >
                  {b.label}
                  <span className="text-label font-normal text-ink-2">{current ? "current" : "free"}</span>
                </button>
              );
            })}
          </div>
          {options.filter((b) => !booking?.beds.includes(b.number)).length === 0 ? (
            <p className="text-body text-ink-2">No other bed in this room is free right now.</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <GlassButton variant="ghost">Cancel</GlassButton>
            </Dialog.Close>
            <GlassButton disabled={picked.length !== need || update.isPending} onClick={save}>
              Move bed
            </GlassButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Check-out through the existing refund dialog (same rules as the Bookings page). */
export function CheckoutFlow({ bookingId, onDone }: { bookingId: string | null; onDone: () => void }) {
  const { data: booking } = useBookingQuery(bookingId ?? "");
  const updateStatus = useUpdateBookingStatusMutation();
  function confirm(amountRefunded: number, extras?: CheckoutConfirmExtras) {
    if (!booking) return;
    updateStatus.mutate(
      {
        id: booking.id,
        status: "checked_out",
        amount_refunded: amountRefunded,
        ...(extras?.rentCollected != null ? { checkout_rent_collected: extras.rentCollected } : {}),
        ...(extras && booking.security_status === "paid" ? { security_returned: extras.securityReturned } : {}),
      },
      {
        onSuccess: () => {
          toast.success(`${booking.guest_name} checked out`);
          onDone();
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Check-out failed"),
      },
    );
  }
  return (
    <BookingRefundDialog
      open={Boolean(bookingId) && Boolean(booking)}
      booking={booking ?? null}
      mode="checkout"
      submitting={updateStatus.isPending}
      onClose={onDone}
      onConfirm={confirm}
    />
  );
}

/** Figma "Guest / …" row in "Guests in this room". */
export function GuestRow({ booking, todayKey: today }: { booking: BedBooking; todayKey: string }) {
  const pay = PAYMENT_TAG[booking.payment_state];
  const sub =
    booking.status !== "checked_in"
      ? `${booking.bed_label} · arrives ${booking.move_in === today ? `today ${booking.expected_arrival_time ?? booking.check_in_time}` : dayMonth(booking.move_in)}`
      : booking.check_out === today
        ? `${booking.bed_label} · leaves today ${booking.check_out_time}`
        : `${booking.bed_label} · ${dayMonth(booking.move_in)} – ${dayMonth(booking.check_out)}`;
  return (
    <Link
      to="/admin/bookings/$id"
      params={{ id: booking.id }}
      className="flex items-center gap-3 rounded-[14px] border border-glass-divider bg-glass-inset px-3 py-2.5 outline-none hover:bg-glass-2 focus-visible:ring-2 focus-visible:ring-brand-border"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-label font-medium text-brand-text">
        {initials(booking.guest_name)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body font-semibold text-ink">{booking.guest_name}</span>
        <span className="truncate text-label font-medium text-ink-2">{sub}</span>
      </span>
      <Tag tone={pay.tone} showDot>
        {pay.label}
      </Tag>
      <ChevronRight className="size-[18px] shrink-0 text-ink-2" aria-hidden />
    </Link>
  );
}

/** Figma "Card / Occupancy" ring (104px). */
export function OccupancyRing({ taken, total }: { taken: number; total: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, taken / total) : 0;
  return (
    <div className="relative size-[104px] shrink-0">
      <svg viewBox="0 0 104 104" className="size-full -rotate-90" aria-hidden>
        <circle cx="52" cy="52" r={r} fill="none" strokeWidth="12" className="stroke-glass-inset" />
        <circle
          cx="52"
          cy="52"
          r={r}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          className="stroke-brand"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-hero text-ink">
          {taken}/{total}
        </span>
        <span className="text-label text-ink-2">taken</span>
      </div>
    </div>
  );
}
