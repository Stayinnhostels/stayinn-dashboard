import { parseBookingNotes } from "@/lib/booking-notes";
import type { Booking } from "@/types/domain/booking.types";

type Props = {
  booking: Booking;
};

export function BookingNotesDisplay({ booking }: Props) {
  const { guestNote, events } = parseBookingNotes(booking.notes, booking.currency);

  if (!guestNote && events.length === 0) return null;

  return (
    <div className="sm:col-span-2 space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notes</p>

      {guestNote ? (
        <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Guest note</p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{guestNote}</p>
        </div>
      ) : null}

      {events.length > 0 ? (
        <ul className="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Activity</p>
          {events.map((ev, i) => (
            <li key={i} className="text-sm">
              <span
                className={
                  ev.kind === "cancelled"
                    ? "font-semibold text-rose-600"
                    : ev.kind === "price_adjusted"
                      ? "font-semibold text-amber-700"
                      : "font-semibold text-foreground"
                }
              >
                {ev.kind === "cancelled"
                  ? "Cancelled"
                  : ev.kind === "price_adjusted"
                    ? "Price adjusted"
                    : "Note"}
                {ev.date ? ` · ${ev.date}` : ""}
              </span>
              <p className="mt-0.5 text-muted-foreground">{ev.text}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
