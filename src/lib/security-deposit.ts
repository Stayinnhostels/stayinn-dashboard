import type { Booking } from "@/types/domain/booking.types";

/** Flat default security deposit for monthly stays (not per seat). */
export const DEFAULT_SECURITY_PKR = 10000;
export const DEFAULT_SECURITY_USD = 100;

/** @deprecated Prefer DEFAULT_SECURITY_PKR — flat deposit, not per seat. */
export const SECURITY_PER_SEAT_PKR = DEFAULT_SECURITY_PKR;
/** @deprecated Prefer DEFAULT_SECURITY_USD */
export const SECURITY_PER_SEAT_USD = DEFAULT_SECURITY_USD;

export function securityPerSeat(currency: "pkr" | "usd") {
  return currency === "usd" ? DEFAULT_SECURITY_USD : DEFAULT_SECURITY_PKR;
}

/** Default security for a monthly booking. `seats` is ignored (flat amount). */
export function securityDepositForSeats(_seats: number, currency: "pkr" | "usd") {
  return securityPerSeat(currency);
}

export function isMonthlyBooking(booking: Booking) {
  return booking.stay_unit !== "night" && booking.months >= 1;
}

export function bookingSecurityAmount(booking: Booking, currency: "pkr" | "usd") {
  if (!isMonthlyBooking(booking)) return null;
  return booking.security_amount ?? securityDepositForSeats(booking.seats_booked, currency);
}
