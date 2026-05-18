import { useQuery } from "@tanstack/react-query";
import { getBookingsApi } from "@/api/bookings";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { BookingsListParams } from "@/types/domain/booking.types";

export function useBookingsQuery(params: BookingsListParams) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view bookings");
      return getBookingsApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 0,
  });
}
