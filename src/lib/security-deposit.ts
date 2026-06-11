import type { Booking } from "@/types/domain/booking.types";

export const SECURITY_PER_SEAT_PKR = 5000;
export const SECURITY_PER_SEAT_USD = 50;

export function securityPerSeat(currency: "pkr" | "usd") {
  return currency === "usd" ? SECURITY_PER_SEAT_USD : SECURITY_PER_SEAT_PKR;
}

export function securityDepositForSeats(seats: number, currency: "pkr" | "usd") {
  const count = Math.max(1, Number(seats) || 1);
  return securityPerSeat(currency) * count;
}

export function isMonthlyBooking(booking: Booking) {
  return booking.stay_unit !== "night" && booking.months >= 1;
}

export function bookingSecurityAmount(booking: Booking, currency: "pkr" | "usd") {
  if (!isMonthlyBooking(booking)) return null;
  return booking.security_amount ?? securityDepositForSeats(booking.seats_booked, currency);
}
