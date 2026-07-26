import type { Booking } from "@/types/domain/booking.types";

export type PropertyInvoiceSettings = {
  hotelName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
};

export type InvoiceLineItem = {
  description: string;
  detail: string;
  quantity: string;
  unitPrice: string;
  amount: number;
};

export type BookingInvoiceData = {
  booking: Booking;
  property: PropertyInvoiceSettings;
  invoiceNumber: string;
  bookingReference: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  total: number;
  amountInWords: string;
  notes: string | null;
};
