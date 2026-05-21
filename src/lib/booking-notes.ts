import { formatMoney, normalizeMoneyCurrency, type MoneyCurrency } from "@/lib/payments";

export type BookingNoteEvent = {
  kind: "cancelled" | "price_adjusted" | "other";
  date: string | null;
  text: string;
};

/** Fix legacy notes that used ₹ for USD bookings. */
export function normalizeLegacyNoteText(text: string, currency: MoneyCurrency): string {
  if (currency === "usd") {
    return text.replace(/₹\s*([\d,]+(?:\.\d+)?)/g, (_, raw) => {
      const n = Number(String(raw).replace(/,/g, ""));
      return Number.isFinite(n) ? formatMoney(n, "usd") : `$${raw}`;
    });
  }
  return text.replace(/₹\s*/g, "Rs ");
}

export function parseBookingNotes(
  notes: string | null | undefined,
  currency?: string | null,
): { guestNote: string | null; events: BookingNoteEvent[] } {
  if (!notes?.trim()) return { guestNote: null, events: [] };

  const cur = normalizeMoneyCurrency(currency);
  const lines = notes
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const guestParts: string[] = [];
  const events: BookingNoteEvent[] = [];

  for (const raw of lines) {
    const line = normalizeLegacyNoteText(raw, cur);
    const cancelled = line.match(/^\[Cancelled (\d{4}-\d{2}-\d{2})\]\s*(.+)$/i);
    const adjusted = line.match(/^\[Price adjusted (\d{4}-\d{2}-\d{2})\]\s*(.+)$/i);

    if (cancelled) {
      events.push({ kind: "cancelled", date: cancelled[1], text: cancelled[2] });
    } else if (adjusted) {
      events.push({ kind: "price_adjusted", date: adjusted[1], text: adjusted[2] });
    } else if (!/^\[/.test(line)) {
      guestParts.push(line);
    } else {
      events.push({ kind: "other", date: null, text: line });
    }
  }

  return {
    guestNote: guestParts.length > 0 ? guestParts.join("\n") : null,
    events,
  };
}
