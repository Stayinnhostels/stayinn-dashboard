import {
  BOOKING_RULES_PAGE_DEFAULTS,
  type BookingRulesPageForm,
} from "@/lib/booking-rules-page-defaults";
import type { PropertySettings } from "@/types/domain/property-settings.types";

export { BOOKING_RULES_PAGE_DEFAULTS };
export type { BookingRulesPageForm };

export function pickBookingRulesPage(settings: PropertySettings): BookingRulesPageForm {
  return {
    roomsFilterMinPrice: settings.roomsFilterMinPrice ?? BOOKING_RULES_PAGE_DEFAULTS.roomsFilterMinPrice,
    roomsFilterMaxPrice: settings.roomsFilterMaxPrice ?? BOOKING_RULES_PAGE_DEFAULTS.roomsFilterMaxPrice,
    checkInTime: settings.checkInTime || BOOKING_RULES_PAGE_DEFAULTS.checkInTime,
    checkOutTime: settings.checkOutTime || BOOKING_RULES_PAGE_DEFAULTS.checkOutTime,
    quietHoursStart: settings.quietHoursStart || BOOKING_RULES_PAGE_DEFAULTS.quietHoursStart,
    quietHoursEnd: settings.quietHoursEnd || BOOKING_RULES_PAGE_DEFAULTS.quietHoursEnd,
    minStay: settings.minStay ?? BOOKING_RULES_PAGE_DEFAULTS.minStay,
    maxStay: settings.maxStay ?? BOOKING_RULES_PAGE_DEFAULTS.maxStay,
    advanceBookingDays: settings.advanceBookingDays ?? BOOKING_RULES_PAGE_DEFAULTS.advanceBookingDays,
    depositPercent: settings.depositPercent ?? BOOKING_RULES_PAGE_DEFAULTS.depositPercent,
    cancellationPolicy: settings.cancellationPolicy || BOOKING_RULES_PAGE_DEFAULTS.cancellationPolicy,
    cancellationWindowHours:
      settings.cancellationWindowHours ?? BOOKING_RULES_PAGE_DEFAULTS.cancellationWindowHours,
    allowChildren: settings.allowChildren ?? BOOKING_RULES_PAGE_DEFAULTS.allowChildren,
    allowPets: settings.allowPets ?? BOOKING_RULES_PAGE_DEFAULTS.allowPets,
    smokingAllowed: settings.smokingAllowed ?? BOOKING_RULES_PAGE_DEFAULTS.smokingAllowed,
    houseRules: settings.houseRules || BOOKING_RULES_PAGE_DEFAULTS.houseRules,
  };
}
