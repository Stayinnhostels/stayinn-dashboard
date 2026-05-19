import type { PropertyInvoiceSettings } from "@/lib/invoice/types";

const STORAGE_KEY = "stayinn.admin.settings.v2";

const DEFAULTS: PropertyInvoiceSettings = {
  hotelName: "Stay Inn Hostels",
  tagline: "Your home away from home",
  email: "hello@stayinn.example",
  phone: "+91 300 1234567",
  address: "123 Hostel Lane",
  city: "Mumbai",
  country: "India",
};

export function loadPropertyInvoiceSettings(): PropertyInvoiceSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<PropertyInvoiceSettings>;
    return {
      hotelName: parsed.hotelName ?? DEFAULTS.hotelName,
      tagline: parsed.tagline ?? DEFAULTS.tagline,
      email: parsed.email ?? DEFAULTS.email,
      phone: parsed.phone ?? DEFAULTS.phone,
      address: parsed.address ?? DEFAULTS.address,
      city: parsed.city ?? DEFAULTS.city,
      country: parsed.country ?? DEFAULTS.country,
    };
  } catch {
    return DEFAULTS;
  }
}
