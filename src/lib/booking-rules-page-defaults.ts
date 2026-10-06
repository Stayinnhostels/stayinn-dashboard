import type { PropertySettings } from "@/types/domain/property-settings.types";

export type BookingRulesPageForm = Pick<
  PropertySettings,
  | "roomsFilterMinPrice"
  | "roomsFilterMaxPrice"
  | "checkInTime"
  | "checkOutTime"
  | "quietHoursStart"
  | "quietHoursEnd"
  | "minStay"
  | "maxStay"
  | "advanceBookingDays"
  | "depositPercent"
  | "cancellationPolicy"
  | "cancellationWindowHours"
  | "allowChildren"
  | "allowPets"
  | "smokingAllowed"
  | "houseRules"
>;

export const BOOKING_RULES_PAGE_DEFAULTS: BookingRulesPageForm = {
  roomsFilterMinPrice: 3000,
  roomsFilterMaxPrice: 50000,
  checkInTime: "14:00",
  checkOutTime: "11:00",
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  minStay: 1,
  maxStay: 30,
  advanceBookingDays: 365,
  depositPercent: 25,
  cancellationPolicy: "moderate",
  cancellationWindowHours: 48,
  allowChildren: true,
  allowPets: false,
  smokingAllowed: false,
  houseRules:
    "• No loud music after 10pm\n• Keep common areas clean\n• Be respectful of other guests\n• ID required at check-in\n• Minimum stay of 3 months — leave earlier and security is not refundable\n• After 3 months, give at least 1 month written notice before vacating",
};
