import { useQuery } from "@tanstack/react-query";
import { getRevenueSummaryApi } from "@/api/bookings/getRevenueSummary.api";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

export function useRevenueSummaryQuery() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: bookingKeys.revenue(),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view revenue");
      return getRevenueSummaryApi(token);
    },
    enabled: Boolean(token),
    staleTime: 0,
  });
}
