import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchBookingStatusApi } from "@/api/bookings";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { roomKeys } from "@/queries/keys/room.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { BookingStatus } from "@/types/domain/booking.types";

export function useUpdateBookingStatusMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => {
      if (!token) throw new Error("You must be signed in");
      return patchBookingStatusApi(token, id, status);
    },
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}
