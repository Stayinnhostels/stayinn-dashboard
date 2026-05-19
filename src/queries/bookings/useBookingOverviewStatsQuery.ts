import { useQuery } from "@tanstack/react-query";
import { getBookingOverviewStatsApi } from "@/api/bookings/getBookingOverviewStats.api";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

export function useBookingOverviewStatsQuery(days = 30, weeks = 8, months = 6) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: bookingKeys.overview(days, weeks, months),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view booking stats");
      return getBookingOverviewStatsApi(token, { days, weeks, months });
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}
