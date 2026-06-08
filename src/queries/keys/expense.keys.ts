import type { ExpenseListParams, ProfitLossParams } from "@/types/domain/expense.types";

export const expenseKeys = {
  all: ["expenses"] as const,
  profitLoss: (params: ProfitLossParams) => [...expenseKeys.all, "profit-loss", params] as const,
  list: (params: ExpenseListParams) => [...expenseKeys.all, "list", params] as const,
};
