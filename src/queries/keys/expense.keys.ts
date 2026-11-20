import type { ExpenseListParams, FinanceOverviewParams, ProfitLossParams } from "@/types/domain/expense.types";

export const expenseKeys = {
  all: ["expenses"] as const,
  profitLoss: (params: ProfitLossParams) => [...expenseKeys.all, "profit-loss", params] as const,
  list: (params: ExpenseListParams) => [...expenseKeys.all, "list", params] as const,
  finance: (params: FinanceOverviewParams) => [...expenseKeys.all, "finance", params] as const,
  recurring: (hostel?: string) => [...expenseKeys.all, "recurring", hostel ?? null] as const,
};
