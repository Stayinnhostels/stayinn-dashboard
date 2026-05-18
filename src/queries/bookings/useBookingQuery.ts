import { useQuery } from "@tanstack/react-query";
import { getBookingApi } from "@/api/bookings";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

export function useBookingQuery(id: string) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getBookingApi(token, id);
    },
    enabled: Boolean(token && id),
    staleTime: 0,
  });
}
