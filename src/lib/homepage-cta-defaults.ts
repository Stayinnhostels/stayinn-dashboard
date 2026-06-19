import type { PropertySettings } from "@/types/domain/property-settings.types";

export const HOMEPAGE_CTA_DEFAULTS: Pick<
  PropertySettings,
  | "homeCtaShow"
  | "homeCtaTitleLine1"
  | "homeCtaTitleLine2"
  | "homeCtaDescription"
  | "homeCtaPrimaryLabel"
  | "homeCtaPrimaryHref"
  | "homeCtaSecondaryLabel"
  | "homeCtaSecondaryHref"
  | "homeCtaShowSecondary"
> = {
  homeCtaShow: true,
  homeCtaTitleLine1: "Your seat is waiting.",
  homeCtaTitleLine2: "Book in 60 seconds.",
  homeCtaDescription:
    "Reserve your bed today with zero deposit. Move in whenever you're ready — flexible monthly stays, no lock-ins.",
  homeCtaPrimaryLabel: "Book Your Seat",
  homeCtaPrimaryHref: "/booking",
  homeCtaSecondaryLabel: "Schedule a Visit",
  homeCtaSecondaryHref: "/contact",
  homeCtaShowSecondary: true,
};
