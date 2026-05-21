import type { BookingsListParams } from "@/types/domain/booking.types";

export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (params: BookingsListParams) => [...bookingKeys.lists(), params] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  dailyStats: (days: number) => [...bookingKeys.all, "daily-stats", days] as const,
  overview: (days: number, weeks: number, months: number) =>
    [...bookingKeys.all, "overview", days, weeks, months] as const,
  revenue: () => [...bookingKeys.all, "revenue"] as const,
};
