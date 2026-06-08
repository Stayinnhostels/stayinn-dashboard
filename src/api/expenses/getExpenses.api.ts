import { apiFetch } from "@/api/apiFetch";
import type {
  Expense,
  ExpenseListParams,
  ProfitLossMonthBlock,
  ProfitLossParams,
  ProfitLossSeriesPoint,
} from "@/types/domain/expense.types";

type Pagination = { page: number; limit: number; total: number; pages: number };

type ProfitLossResponse = {
  success: boolean;
  current: ProfitLossMonthBlock;
  series: ProfitLossSeriesPoint[];
  history: {
    months: ProfitLossMonthBlock[];
    pagination: Pagination;
  };
};

export async function getProfitLossApi(token: string, params: ProfitLossParams = {}) {
  const search = new URLSearchParams();
  if (params.month) search.set("month", params.month);
  if (params.months != null) search.set("months", String(params.months));
  if (params.history_page != null) search.set("history_page", String(params.history_page));
  if (params.history_limit != null) search.set("history_limit", String(params.history_limit));

  const q = search.toString();
  const data = await apiFetch<ProfitLossResponse>(
    `/api/v1/expenses/profit-loss${q ? `?${q}` : ""}`,
    { token },
  );
  if (!data.success || !data.current?.detail) {
    throw new Error("Invalid profit & loss response");
  }
  return {
    current: data.current,
    series: data.series ?? [],
    history: {
      months: data.history?.months ?? [],
      pagination: data.history?.pagination ?? { page: 1, limit: 4, total: 0, pages: 1 },
    },
  };
}

type ListExpensesResponse = {
  success: boolean;
  expenses: Expense[];
  pagination: Pagination;
};

export async function getExpensesApi(token: string, params: ExpenseListParams = {}) {
  const search = new URLSearchParams();
  if (params.month) search.set("month", params.month);
  if (params.category) search.set("category", params.category);
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));

  const q = search.toString();
  const data = await apiFetch<ListExpensesResponse>(`/api/v1/expenses${q ? `?${q}` : ""}`, { token });
  if (!data.success || !Array.isArray(data.expenses)) {
    throw new Error("Invalid expenses list response");
  }
  return { expenses: data.expenses, pagination: data.pagination };
}
