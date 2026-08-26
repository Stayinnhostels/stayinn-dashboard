import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resolveBookingRequestApi } from "@/api/booking-requests/bookingRequests.api";
import { bookingRequestKeys } from "@/queries/keys/booking-request.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { BookingRequestStatus } from "@/types/domain/booking-request.types";

export function useResolveBookingRequestMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      admin_note,
      amount_refunded,
    }: {
      id: string;
      status: Extract<BookingRequestStatus, "approved" | "rejected">;
      admin_note?: string;
      amount_refunded?: number;
    }) => {
      if (!token) throw new Error("You must be signed in");
      return resolveBookingRequestApi(token, id, { status, admin_note, amount_refunded });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingRequestKeys.all });
    },
  });
}
