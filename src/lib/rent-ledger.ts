import type { Booking } from "@/types/domain/booking.types";
import type { RentPaymentStatus } from "@/types/domain/resident.types";

export function enumerateStayMonths(moveIn: string | null, checkOut: string | null): string[] {
  if (!moveIn || !checkOut) return [];
  const start = new Date(moveIn.includes("T") ? moveIn : `${moveIn}T12:00:00`);
  const end = new Date(checkOut.includes("T") ? checkOut : `${checkOut}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

  const keys: string[] = [];
  let y = start.getFullYear();
  let m = start.getMonth();
  const endY = end.getFullYear();
  const endM = end.getMonth();

  while (y < endY || (y === endY && m <= endM)) {
    keys.push(`${y}-${String(m + 1).padStart(2, "0")}`);
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return keys;
}

export function monthLabel(monthKey: string) {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });
}

export function defaultMonthlyRentAmount(booking: Booking) {
  return Math.round(booking.price_per_seat * booking.seats_booked * 100) / 100;
}

export type BookingRentMonth = {
  month: string;
  label: string;
  rent_amount: number;
  payment_status: RentPaymentStatus;
};

export function buildBookingRentTimeline(booking: Booking): BookingRentMonth[] {
  const stayMonths = enumerateStayMonths(booking.move_in, booking.check_out);
  const ledger = booking.rent_ledger ?? [];
  const fallbackRent = defaultMonthlyRentAmount(booking);

  return stayMonths.map((monthKey) => {
    const entry = ledger.find((e) => e.month === monthKey);
    return {
      month: monthKey,
      label: monthLabel(monthKey),
      rent_amount: entry?.rent_amount ?? fallbackRent,
      payment_status: (entry?.payment_status ?? "not_paid") as RentPaymentStatus,
    };
  });
}

export function rentCollectedFromTimeline(months: BookingRentMonth[]) {
  return months.reduce((sum, m) => {
    if (m.payment_status === "paid") return sum + m.rent_amount;
    if (m.payment_status === "partial") return sum + m.rent_amount * 0.5;
    return sum;
  }, 0);
}
