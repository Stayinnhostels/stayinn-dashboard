import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteRecurringExpenseApi,
  getExpensesApi,
  getFinanceOverviewApi,
  getRecurringExpensesApi,
  postRecurringExpenseApi,
} from "@/api/expenses";
import { expenseKeys } from "@/queries/keys/expense.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { ExpenseListParams, FinanceOverviewParams, RecurringExpenseInput } from "@/types/domain/expense.types";

/** Figma 15.01 — revenue, expenses and profit per month. */
export function useFinanceOverviewQuery(params: FinanceOverviewParams, enabled = true) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: expenseKeys.finance(params),
    queryFn: () => getFinanceOverviewApi(token!, params),
    enabled: enabled && Boolean(token),
    placeholderData: keepPreviousData,
  });
}

/** Figma 15.02 — one month's expenses with category counts. */
export function useExpensesListQuery(params: ExpenseListParams, enabled = true) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => getExpensesApi(token!, params),
    enabled: enabled && Boolean(token),
    placeholderData: keepPreviousData,
  });
}

export function useRecurringExpensesQuery(hostel?: string, enabled = true) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: expenseKeys.recurring(hostel),
    queryFn: () => getRecurringExpensesApi(token!, hostel),
    enabled: enabled && Boolean(token),
  });
}

export function useCreateRecurringExpenseMutation() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RecurringExpenseInput) => postRecurringExpenseApi(token!, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}

export function useDeleteRecurringExpenseMutation() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecurringExpenseApi(token!, id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: expenseKeys.all }),
  });
}
