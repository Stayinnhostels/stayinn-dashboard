import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSecurityPaymentsApi } from "@/api/bookings/getSecurityPayments.api";
import { postSecurityMovementApi } from "@/api/bookings/postSecurityMovement.api";
import { useAuthStore } from "@/stores/auth/auth.store";
import type {
  RecordSecurityMovementInput,
  SecurityPaymentsListParams,
} from "@/types/domain/security-payment.types";
import { paymentKeys } from "@/queries/payments/usePaymentsQuery";

export const securityPaymentKeys = {
  all: ["security-payments"] as const,
  list: (params: SecurityPaymentsListParams) => [...securityPaymentKeys.all, "list", params] as const,
};

export function useSecurityPaymentsQuery(
  params: SecurityPaymentsListParams,
  options: { enabled?: boolean } = {},
) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: securityPaymentKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view security payments");
      return getSecurityPaymentsApi(token, params);
    },
    enabled: (options.enabled ?? true) && Boolean(token),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useRecordSecurityMovementMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, input }: { bookingId: string; input: RecordSecurityMovementInput }) => {
      if (!token) throw new Error("You must be signed in");
      return postSecurityMovementApi(token, bookingId, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: securityPaymentKeys.all });
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["residents"] });
    },
  });
}
