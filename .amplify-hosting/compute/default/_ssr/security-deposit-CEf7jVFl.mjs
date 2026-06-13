import { u as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { b as bookingKeys } from "./booking.keys-CTE8dzAR.mjs";
import { r as residentKeys, e as expenseKeys } from "./resident.keys-DK2A-v-L.mjs";
import { p as paymentKeys } from "./usePaymentsQuery-Blc2sag1.mjs";
import { r as roomKeys } from "./room.keys-BMDsz0NU.mjs";
async function postManualBookingApi(token, input) {
  const data = await apiFetch("/api/v1/bookings/manual", {
    method: "POST",
    token,
    body: JSON.stringify(input)
  });
  if (!data.success || !data.booking) {
    throw new Error(data.message ?? "Could not add member");
  }
  return data.booking;
}
async function patchBookingStatusApi(token, id, input) {
  const data = await apiFetch(`/api/v1/bookings/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input)
  });
  if (!data.success || !data.booking) {
    throw new Error("Failed to update booking");
  }
  return data.booking;
}
async function patchBookingPricingApi(token, id, input) {
  const data = await apiFetch(
    `/api/v1/bookings/${encodeURIComponent(id)}/pricing`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(input)
    }
  );
  if (!data.success || !data.booking) {
    throw new Error(data.message ?? "Could not update booking price");
  }
  return data.booking;
}
function useCreateManualBookingMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => {
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
    }
  });
}
function useUpdateBookingPricingMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => {
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
    }
  });
}
function useUpdateBookingStatusMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => {
      if (!token) throw new Error("You must be signed in");
      const { id, status, amount_refunded, security_returned } = input;
      return patchBookingStatusApi(token, id, { status, amount_refunded, security_returned });
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
    }
  });
}
const SECURITY_PER_SEAT_PKR = 5e3;
const SECURITY_PER_SEAT_USD = 50;
function securityPerSeat(currency) {
  return currency === "usd" ? SECURITY_PER_SEAT_USD : SECURITY_PER_SEAT_PKR;
}
function securityDepositForSeats(seats, currency) {
  const count = Math.max(1, Number(seats) || 1);
  return securityPerSeat(currency) * count;
}
function isMonthlyBooking(booking) {
  return booking.stay_unit !== "night" && booking.months >= 1;
}
function bookingSecurityAmount(booking, currency) {
  if (!isMonthlyBooking(booking)) return null;
  return booking.security_amount ?? securityDepositForSeats(booking.seats_booked, currency);
}
export {
  useCreateManualBookingMutation as a,
  securityDepositForSeats as b,
  bookingSecurityAmount as c,
  useUpdateBookingPricingMutation as d,
  isMonthlyBooking as i,
  securityPerSeat as s,
  useUpdateBookingStatusMutation as u
};
