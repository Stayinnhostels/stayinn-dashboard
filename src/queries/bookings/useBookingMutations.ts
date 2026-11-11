import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  patchBookingDetailsApi,
  patchBookingPricingApi,
  patchBookingRoomApi,
  patchBookingStatusApi,
  postManualBookingApi,
} from "@/api/bookings";
import type { CreateManualBookingInput } from "@/api/bookings/postManualBooking.api";
import type { UpdateBookingPricingInput } from "@/api/bookings/patchBookingPricing.api";
import type { UpdateBookingDetailsInput } from "@/api/bookings/patchBookingDetails.api";
import type { TransferBookingRoomInput } from "@/api/bookings/patchBookingRoom.api";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { expenseKeys } from "@/queries/keys/expense.keys";
import { residentKeys } from "@/queries/keys/resident.keys";
import { paymentKeys } from "@/queries/payments";
import { roomKeys } from "@/queries/keys/room.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { UpdateBookingStatusInput } from "@/api/bookings/patchBookingStatus.api";

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
      void queryClient.invalidateQueries({ queryKey: bookingKeys.revenue() });
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      void queryClient.invalidateQueries({ queryKey: residentKeys.all });
      void queryClient.invalidateQueries({ queryKey: expenseKeys.all });
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
      void queryClient.invalidateQueries({ queryKey: bookingKeys.revenue() });
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
    mutationFn: (input: { id: string } & UpdateBookingStatusInput) => {
      if (!token) throw new Error("You must be signed in");
      const { id, status, amount_refunded, security_returned, checkout_rent_collected } = input;
      return patchBookingStatusApi(token, id, {
        status,
        amount_refunded,
        security_returned,
        checkout_rent_collected,
      });
    },
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      void queryClient.invalidateQueries({ queryKey: bookingKeys.revenue() });
      void queryClient.invalidateQueries({ queryKey: [...bookingKeys.all, "overview"] });
      void queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      void queryClient.invalidateQueries({ queryKey: residentKeys.all });
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useUpdateBookingDetailsMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBookingDetailsInput }) => {
      if (!token) throw new Error("You must be signed in");
      return patchBookingDetailsApi(token, id, input);
    },
    onSuccess: (booking) => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) });
      void queryClient.invalidateQueries({ queryKey: bookingKeys.revenue() });
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      void queryClient.invalidateQueries({ queryKey: residentKeys.all });
      void queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      if (booking.room_id) {
        void queryClient.invalidateQueries({ queryKey: roomKeys.detail(booking.room_id) });
      }
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useTransferBookingRoomMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
      previousRoomId,
    }: {
      id: string;
      input: TransferBookingRoomInput;
      previousRoomId?: string | null;
    }) => {
      if (!token) throw new Error("You must be signed in");
      return patchBookingRoomApi(token, id, input);
    },
    onSuccess: (booking, { previousRoomId }) => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) });
      void queryClient.invalidateQueries({ queryKey: residentKeys.all });
      void queryClient.invalidateQueries({ queryKey: roomKeys.all });
      if (previousRoomId) {
        void queryClient.invalidateQueries({ queryKey: roomKeys.detail(previousRoomId) });
      }
      if (booking.room_id) {
        void queryClient.invalidateQueries({ queryKey: roomKeys.detail(booking.room_id) });
      }
    },
  });
}
