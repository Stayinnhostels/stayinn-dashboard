import { apiFetch } from "@/api/apiFetch";
import type {
  Expense,
  ExpenseListParams,
  FinanceOverview,
  FinanceOverviewParams,
  RecurringExpense,
  RecurringExpenseInput,
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
  if (params.hostel) search.set("hostel", params.hostel);

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
  category_counts?: Record<string, number>;
  pagination: Pagination;
};

export async function getExpensesApi(token: string, params: ExpenseListParams = {}) {
  const search = new URLSearchParams();
  if (params.month) search.set("month", params.month);
  if (params.category) search.set("category", params.category);
  if (params.search) search.set("search", params.search);
  if (params.hostel) search.set("hostel", params.hostel);
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));

  const q = search.toString();
  const data = await apiFetch<ListExpensesResponse>(`/api/v1/expenses${q ? `?${q}` : ""}`, {
    token,
  });
  if (!data.success || !Array.isArray(data.expenses)) {
    throw new Error("Invalid expenses list response");
  }
  return { expenses: data.expenses, category_counts: data.category_counts ?? {}, pagination: data.pagination };
}

export async function getFinanceOverviewApi(token: string, params: FinanceOverviewParams = {}) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) search.set(k, String(v));
  const q = search.toString();
  const data = await apiFetch<{ success: boolean } & FinanceOverview>(`/api/v1/expenses/finance-overview${q ? `?${q}` : ""}`, { token });
  if (!data.success || !Array.isArray(data.months)) throw new Error("Invalid revenue response");
  return data as FinanceOverview;
}

export async function getExpenseReceiptApi(token: string, id: string) {
  const data = await apiFetch<{ success: boolean; receipt: string; receipt_name: string }>(`/api/v1/expenses/${id}/receipt`, { token });
  return { receipt: data.receipt, receipt_name: data.receipt_name };
}

export async function getRecurringExpensesApi(token: string, hostel?: string) {
  const data = await apiFetch<{ success: boolean; recurring: RecurringExpense[] }>(`/api/v1/expenses/recurring${hostel ? `?hostel=${hostel}` : ""}`, { token });
  return data.recurring ?? [];
}

export async function postRecurringExpenseApi(token: string, input: RecurringExpenseInput) {
  const data = await apiFetch<{ success: boolean; recurring: RecurringExpense }>("/api/v1/expenses/recurring", { token, method: "POST", body: JSON.stringify(input) });
  return data.recurring;
}

export async function deleteRecurringExpenseApi(token: string, id: string) {
  await apiFetch<{ success: boolean }>(`/api/v1/expenses/recurring/${id}`, { token, method: "DELETE" });
}
