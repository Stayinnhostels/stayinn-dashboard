import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resolveBookingRequestApi } from "@/api/booking-requests/bookingRequests.api";
import { bookingRequestKeys } from "@/queries/keys/booking-request.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { BookingRequestStatus, RefundMethod } from "@/types/domain/booking-request.types";

export function useResolveBookingRequestMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      admin_note,
      amount_refunded,
      refund_method,
      reply_template,
      notify_guest,
    }: {
      id: string;
      status: Extract<BookingRequestStatus, "approved" | "rejected">;
      admin_note?: string;
      amount_refunded?: number;
      refund_method?: RefundMethod;
      reply_template?: string;
      notify_guest?: boolean;
    }) => {
      if (!token) throw new Error("You must be signed in");
      return resolveBookingRequestApi(token, id, { status, admin_note, amount_refunded, refund_method, reply_template, notify_guest });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingRequestKeys.all });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "nav-counts"] });
    },
  });
}
