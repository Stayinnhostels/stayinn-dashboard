import type { Booking } from "@/types/domain/booking.types";
import type { BookingInvoiceData, PropertyInvoiceSettings } from "@/lib/invoice/types";

function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDisplayDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function invoiceNumberFromBookingId(id: string) {
  return `INV-${id.replace(/[^a-zA-Z0-9]/g, "").slice(-10).toUpperCase()}`;
}

function bookingReferenceFromId(id: string) {
  return `BK-${id.slice(-8).toUpperCase()}`;
}

/** Simple amount-in-words for Indian Rupees (whole numbers). */
function amountInWordsInr(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return "";
  const n = Math.round(amount);
  if (n === 0) return "Zero Rupees Only";

  const ones = [
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
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function under1000(num: number): string {
    if (num === 0) return "";
    if (num < 20) return ones[num];
    if (num < 100) return `${tens[Math.floor(num / 10)]}${num % 10 ? ` ${ones[num % 10]}` : ""}`.trim();
    return `${ones[Math.floor(num / 100)]} Hundred${num % 100 ? ` ${under1000(num % 100)}` : ""}`.trim();
  }

  function convert(num: number): string {
    if (num < 1000) return under1000(num);
    if (num < 100_000) {
      return `${under1000(Math.floor(num / 1000))} Thousand${num % 1000 ? ` ${under1000(num % 1000)}` : ""}`.trim();
    }
    if (num < 10_000_000) {
      return `${under1000(Math.floor(num / 100_000))} Lakh${num % 100_000 ? ` ${convert(num % 100_000)}` : ""}`.trim();
    }
    return `${under1000(Math.floor(num / 10_000_000))} Crore${num % 10_000_000 ? ` ${convert(num % 10_000_000)}` : ""}`.trim();
  }

  return `${convert(n)} Rupees Only`;
}

export function buildBookingInvoice(
  booking: Booking,
  property: PropertyInvoiceSettings,
): BookingInvoiceData {
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
      unitPrice: formatInr(booking.price_per_seat),
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
    amountInWords: amountInWordsInr(booking.total_amount),
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
    `Amount due: ${formatInr(total)}`,
    ``,
    `We will share the PDF invoice document in this chat. Thank you for choosing ${property.hotelName}.`,
  ].join("\n");
}

export function guestWhatsAppUrl(phone: string, message: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
