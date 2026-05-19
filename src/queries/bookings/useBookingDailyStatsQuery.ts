import { useQuery } from "@tanstack/react-query";
import { getBookingDailyStatsApi } from "@/api/bookings";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

export function useBookingDailyStatsQuery(days = 30) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: bookingKeys.dailyStats(days),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view booking stats");
      return getBookingDailyStatsApi(token, days);
    },
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}
