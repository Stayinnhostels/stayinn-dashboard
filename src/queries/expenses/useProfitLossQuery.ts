import { useQuery } from "@tanstack/react-query";
import { getProfitLossApi } from "@/api/expenses";
import { expenseKeys } from "@/queries/keys/expense.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { ProfitLossParams } from "@/types/domain/expense.types";

export function useProfitLossQuery(params: ProfitLossParams = {}) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: expenseKeys.profitLoss(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view profit & loss");
      return getProfitLossApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 0,
  });
}
