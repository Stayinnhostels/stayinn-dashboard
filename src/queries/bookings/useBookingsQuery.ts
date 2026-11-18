import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { getBookingsApi, getBookingsSummaryApi, postBookingRemindersApi } from "@/api/bookings";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { BookingsListParams } from "@/types/domain/booking.types";

type UseBookingsQueryOptions = {
  enabled?: boolean;
};

export function useBookingsQuery(params: BookingsListParams, options: UseBookingsQueryOptions = {}) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view bookings");
      return getBookingsApi(token, params);
    },
    enabled: (options.enabled ?? true) && Boolean(token),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

/** KPI row + status tab counts (GET /bookings/summary). */
export function useBookingsSummaryQuery(hostel?: string, options: UseBookingsQueryOptions = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: bookingKeys.summary(hostel),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view bookings");
      return getBookingsSummaryApi(token, hostel);
    },
    enabled: (options.enabled ?? true) && Boolean(token),
    staleTime: 15_000,
  });
}

/** "Send reminder" bulk action. */
export function useSendBookingRemindersMutation() {
  const token = useAuthStore((s) => s.token);
  return useMutation({
    mutationFn: (ids: string[]) => {
      if (!token) throw new Error("You must be signed in");
      return postBookingRemindersApi(token, ids);
    },
  });
}
