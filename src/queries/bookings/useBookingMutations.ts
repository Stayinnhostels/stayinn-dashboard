import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchBookingPricingApi, patchBookingStatusApi, postManualBookingApi } from "@/api/bookings";
import type { CreateManualBookingInput } from "@/api/bookings/postManualBooking.api";
import type { UpdateBookingPricingInput } from "@/api/bookings/patchBookingPricing.api";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { roomKeys } from "@/queries/keys/room.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { BookingStatus } from "@/types/domain/booking.types";

export function useCreateManualBookingMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateManualBookingInput) => {
      if (!token) throw new Error("You must be signed in");
      return postManualBookingApi(token, input);
    },
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      if (booking.room_id) {
        void queryClient.invalidateQueries({ queryKey: roomKeys.detail(booking.room_id) });
      }
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useUpdateBookingPricingMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBookingPricingInput }) => {
      if (!token) throw new Error("You must be signed in");
      return patchBookingPricingApi(token, id, input);
    },
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) });
      if (booking.room_id) {
        void queryClient.invalidateQueries({ queryKey: roomKeys.detail(booking.room_id) });
      }
    },
  });
}

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
