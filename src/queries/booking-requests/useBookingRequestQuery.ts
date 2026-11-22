import { useQuery } from "@tanstack/react-query";
import { getBookingRequestApi } from "@/api/booking-requests/bookingRequests.api";
import { bookingRequestKeys } from "@/queries/keys/booking-request.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

/** One request + "what changes if you approve" (Figma 10.01 / 10.02). */
export function useBookingRequestQuery(id: string | null) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: bookingRequestKeys.detail(id ?? ""),
    queryFn: () => {
      if (!token || !id) throw new Error("You must be signed in");
      return getBookingRequestApi(token, id);
    },
    enabled: Boolean(token && id),
    staleTime: 10_000,
  });
}
