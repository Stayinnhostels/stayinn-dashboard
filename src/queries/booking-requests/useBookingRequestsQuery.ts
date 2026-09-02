import { useQuery } from "@tanstack/react-query";
import { getBookingRequestsApi } from "@/api/booking-requests/bookingRequests.api";
import { bookingRequestKeys } from "@/queries/keys/booking-request.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { BookingRequestListParams } from "@/types/domain/booking-request.types";

export function useBookingRequestsQuery(
  params: BookingRequestListParams = {},
  options: { enabled?: boolean } = {},
) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: bookingRequestKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getBookingRequestsApi(token, params);
    },
    enabled: (options.enabled ?? true) && Boolean(token),
    staleTime: 10_000,
  });
}
