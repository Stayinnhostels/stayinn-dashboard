import { useQuery } from "@tanstack/react-query";
import { getPaymentsApi } from "@/api/bookings/getPayments.api";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { PaymentsListParams } from "@/types/domain/payment.types";

export const paymentKeys = {
  all: ["payments"] as const,
  list: (params: PaymentsListParams) => [...paymentKeys.all, "list", params] as const,
};

export function usePaymentsQuery(
  params: PaymentsListParams,
  options: { enabled?: boolean } = {},
) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view payments");
      return getPaymentsApi(token, params);
    },
    enabled: (options.enabled ?? true) && Boolean(token),
    staleTime: 0,
  });
}
