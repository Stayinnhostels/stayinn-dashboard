import { formatMoney, normalizeMoneyCurrency, type MoneyCurrency } from "@/lib/payments";
import type { Booking } from "@/types/domain/booking.types";
import type { BookingInvoiceData, PropertyInvoiceSettings } from "@/lib/invoice/types";

function formatInvoiceAmount(amount: number, booking: Booking) {
  return formatMoney(amount, normalizeMoneyCurrency(booking.currency));
}

function formatDisplayDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function invoiceNumberFromBookingId(id: string) {
  return `INV-${id.replace(/[^a-zA-Z0-9]/g, "").slice(-10).toUpperCase()}`;
}

function bookingReferenceFromId(id: string) {
  return `BK-${id.slice(-8).toUpperCase()}`;
}

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function under1000(num: number): string {
  if (num === 0) return "";
  if (num < 20) return ONES[num];
  if (num < 100) return `${TENS[Math.floor(num / 10)]}${num % 10 ? ` ${ONES[num % 10]}` : ""}`.trim();
  return `${ONES[Math.floor(num / 100)]} Hundred${num % 100 ? ` ${under1000(num % 100)}` : ""}`.trim();
}

function convertEnglish(num: number): string {
  if (num < 1000) return under1000(num);
  if (num < 1_000_000) {
    return `${under1000(Math.floor(num / 1000))} Thousand${num % 1000 ? ` ${under1000(num % 1000)}` : ""}`.trim();
  }
  return `${under1000(Math.floor(num / 1_000_000))} Million${num % 1_000_000 ? ` ${convertEnglish(num % 1_000_000)}` : ""}`.trim();
}

function amountInWords(amount: number, currency: MoneyCurrency): string {
  if (!Number.isFinite(amount) || amount < 0) return "";
  const n = Math.round(amount);
  if (n === 0) return currency === "usd" ? "Zero US Dollars Only" : "Zero Rupees Only";
  const words = convertEnglish(n);
  return currency === "usd" ? `${words} US Dollars Only` : `${words} Rupees Only`;
}

export function buildBookingInvoice(
  booking: Booking,
  property: PropertyInvoiceSettings,
): BookingInvoiceData {
  const cur = normalizeMoneyCurrency(booking.currency);
  const issueDate = booking.created_at
    ? formatDisplayDate(booking.created_at)
    : formatDisplayDate(new Date().toISOString());

  const roomLabel = booking.room_title ?? "Hostel accommodation";
  const lineDetail = `${booking.seats_booked} seat(s) × ${booking.months} month(s) · Move-in ${formatDisplayDate(booking.move_in)} · Check-out ${formatDisplayDate(booking.check_out)}`;

  const lineItems = [
    {
      description: `Seat booking — ${roomLabel}`,
      detail: lineDetail,
      quantity: `${booking.seats_booked * booking.months} seat-month(s)`,
      unitPrice: formatInvoiceAmount(booking.price_per_seat, booking),
      amount: booking.total_amount,
    },
  ];

  return {
    booking,
    property,
    invoiceNumber: invoiceNumberFromBookingId(booking.id),
    bookingReference: bookingReferenceFromId(booking.id),
    issueDate,
    dueDate: formatDisplayDate(booking.move_in),
    lineItems,
    subtotal: booking.total_amount,
    total: booking.total_amount,
    amountInWords: amountInWords(booking.total_amount, cur),
    notes: booking.notes,
  };
}

export function buildInvoiceWhatsAppMessage(data: BookingInvoiceData): string {
  const { booking, property, invoiceNumber, bookingReference, total } = data;
  return [
    `Hello ${booking.guest_name},`,
    ``,
    `Please find your invoice from ${property.hotelName}.`,
    `Invoice: ${invoiceNumber}`,
    `Booking ref: ${bookingReference}`,
    `Room: ${booking.room_title ?? "Hostel seat"}`,
    `Period: ${formatDisplayDate(booking.move_in)} to ${formatDisplayDate(booking.check_out)}`,
    `Amount due: ${formatInvoiceAmount(total, booking)}`,
    ``,
    `We will share the PDF invoice document in this chat. Thank you for choosing ${property.hotelName}.`,
  ].join("\n");
}

export function guestWhatsAppUrl(phone: string, message: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
