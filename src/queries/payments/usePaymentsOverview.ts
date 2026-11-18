import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDepositsOverviewApi,
  getPaymentsOverviewApi,
  getTransactionsApi,
  patchPaymentApi,
  refundPaymentApi,
  type EditPaymentInput,
} from "@/api/payments/paymentsOverview.api";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { residentKeys } from "@/queries/keys/resident.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { TransactionsParams } from "@/types/domain/payments.types";

const KEY = ["payments", "v2"] as const;

export function usePaymentsOverviewQuery(params: { month?: string; hostel?: string; currency?: "pkr" | "usd" }, enabled = true) {
  const token = useAuthStore((s) => s.token);
  return useQuery({ queryKey: [...KEY, "overview", params], queryFn: () => getPaymentsOverviewApi(token!, params), enabled: Boolean(token) && enabled, placeholderData: keepPreviousData });
}

export function useTransactionsQuery(params: TransactionsParams, enabled = true) {
  const token = useAuthStore((s) => s.token);
  return useQuery({ queryKey: [...KEY, "transactions", params], queryFn: () => getTransactionsApi(token!, params), enabled: Boolean(token) && enabled, placeholderData: keepPreviousData });
}

export function useDepositsOverviewQuery(params: { month?: string; hostel?: string; currency?: "pkr" | "usd" }, enabled = true) {
  const token = useAuthStore((s) => s.token);
  return useQuery({ queryKey: [...KEY, "deposits", params], queryFn: () => getDepositsOverviewApi(token!, params), enabled: Boolean(token) && enabled, placeholderData: keepPreviousData });
}

function useInvalidate() {
  const qc = useQueryClient();
  return (bookingId: string) => {
    void qc.invalidateQueries({ queryKey: KEY });
    void qc.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
    void qc.invalidateQueries({ queryKey: residentKeys.all });
  };
}

export function useEditPaymentMutation() {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ bookingId, paymentId, input }: { bookingId: string; paymentId: string; input: EditPaymentInput }) => {
      if (!token) throw new Error("You must be signed in");
      return patchPaymentApi(token, bookingId, paymentId, input);
    },
    onSuccess: (_d, v) => invalidate(v.bookingId),
  });
}

export function useRefundPaymentMutation() {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ bookingId, paymentId, input }: { bookingId: string; paymentId: string; input: { amount?: number; method?: string; reason?: string } }) => {
      if (!token) throw new Error("You must be signed in");
      return refundPaymentApi(token, bookingId, paymentId, input);
    },
    onSuccess: (_d, v) => invalidate(v.bookingId),
  });
}

/** Payments-v2 queries refresh whenever any money changes elsewhere. */
export const PAYMENTS_V2_KEY = KEY;
