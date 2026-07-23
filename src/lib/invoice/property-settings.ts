import type { PropertyInvoiceSettings } from "@/lib/invoice/types";
import type { PublicPropertySettings, PropertySettings } from "@/types/domain/property-settings.types";

export const PROPERTY_INVOICE_DEFAULTS: PropertyInvoiceSettings = {
  hotelName: "Stay Inn Hostels",
  tagline: "Live your journey, stay with us",
  email: "info@stayinnhostels.com",
  phone: "+92 331 0008196",
  address: "Lahore",
  city: "Punjab",
  country: "Pakistan",
  logoUrl: "",
};

export function toInvoicePropertySettings(
  settings?: Partial<PublicPropertySettings | PropertySettings> | null,
): PropertyInvoiceSettings {
  if (!settings) return PROPERTY_INVOICE_DEFAULTS;
  return {
    hotelName: settings.hotelName ?? PROPERTY_INVOICE_DEFAULTS.hotelName,
    tagline: settings.tagline ?? PROPERTY_INVOICE_DEFAULTS.tagline,
    email: settings.email ?? PROPERTY_INVOICE_DEFAULTS.email,
    phone: settings.phone ?? PROPERTY_INVOICE_DEFAULTS.phone,
    address: settings.address ?? PROPERTY_INVOICE_DEFAULTS.address,
    city: settings.city ?? PROPERTY_INVOICE_DEFAULTS.city,
    country: settings.country ?? PROPERTY_INVOICE_DEFAULTS.country,
    logoUrl: settings.logoUrl ?? PROPERTY_INVOICE_DEFAULTS.logoUrl,
  };
}

/** @deprecated Use usePublicPropertySettingsQuery + toInvoicePropertySettings */
export function loadPropertyInvoiceSettings(): PropertyInvoiceSettings {
  return PROPERTY_INVOICE_DEFAULTS;
}
