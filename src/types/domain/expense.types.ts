export type ExpenseCategory =
  | "supplies"
  | "utilities"
  | "staff"
  | "repairs"
  | "food"
  | "cleaning"
  | "rent"
  | "other";

export type ExpenseCurrency = "pkr" | "usd";

export type Expense = {
  id: string;
  title: string;
  amount: number;
  currency: ExpenseCurrency;
  category: ExpenseCategory;
  expense_date: string;
  vendor: string;
  notes: string;
  /** Bill photo attached (Figma 15.03) — fetch it with getExpenseReceiptApi. */
  has_receipt?: boolean;
  receipt_name?: string;
  /** Added by a "Repeat every month" rule. */
  recurring_id?: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ExpenseDraft = {
  title: string;
  amount: number;
  currency: ExpenseCurrency;
  category: ExpenseCategory;
  expense_date: string;
  vendor: string;
  notes: string;
  /** Property this expense belongs to (required for multi-hostel lists). */
  hostel?: string;
  /** Bill photo as a data URL. */
  receipt?: string;
  receipt_name?: string;
  remove_receipt?: boolean;
  /** Also create a monthly rule from this expense. */
  repeat_monthly?: boolean;
};

export type ProfitLossMonthDetail = {
  month: string;
  label: string;
  revenue_pkr: number;
  revenue_usd: number;
  security_retained_pkr?: number;
  security_retained_usd?: number;
  expense_pkr: number;
  expense_usd: number;
  profit_pkr: number;
  profit_usd: number;
  expense_count_pkr: number;
  expense_count_usd: number;
};

export type ProfitLossSeriesPoint = {
  key: string;
  label: string;
  revenue_pkr: number;
  revenue_usd: number;
  expense_pkr: number;
  expense_usd: number;
  profit_pkr: number;
  profit_usd: number;
};

export type ProfitLossMonthBlock = {
  month: string;
  label: string;
  detail: ProfitLossMonthDetail;
  expenses: Expense[];
};

export type ProfitLossParams = {
  month?: string;
  months?: number;
  history_page?: number;
  history_limit?: number;
  hostel?: string;
};

export type ExpenseListParams = {
  month?: string;
  category?: ExpenseCategory;
  search?: string;
  hostel?: string;
  page?: number;
  limit?: number;
};

export type RecurringExpense = {
  id: string;
  title: string;
  amount: number;
  currency: ExpenseCurrency;
  category: ExpenseCategory;
  vendor: string;
  notes: string;
  day_of_month: number;
  start_month: string;
  last_added_month: string | null;
  active: boolean;
};

export type RecurringExpenseInput = {
  title: string;
  amount: number;
  currency: ExpenseCurrency;
  category: ExpenseCategory;
  vendor?: string;
  notes?: string;
  day_of_month: number;
  start_month?: string;
  hostel?: string;
};

/** GET /expenses/finance-overview (Figma 15.01 Revenue & profit). */
export type FinanceMonth = {
  key: string;
  label: string;
  short: string;
  in_progress: boolean;
  residents: number;
  rent: number;
  extras: number;
  sources: { dorm: number; private: number; extras: number; meals: number };
  refunds: number;
  kept: number;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number | null;
  by_category: Partial<Record<ExpenseCategory, number>>;
};

export type FinanceTotals = { revenue: number; rent: number; extras: number; expenses: number; profit: number; margin: number | null };

export type FinanceOverview = {
  from: string;
  to: string;
  currency: ExpenseCurrency;
  /** Newest first. */
  months: FinanceMonth[];
  totals: FinanceTotals;
  previous: FinanceTotals;
  profit_change_percent: number | null;
  biggest_categories: { category: ExpenseCategory; label: string; amount: number }[];
  best_month: { key: string; name: string; profit: number } | null;
  sources: { month: string; name: string; in_progress: boolean; dorm: number; private: number; extras: number; meals: number };
  occupancy: { beds: number; free_beds: number; filled_percent: number | null; missed_per_month: number };
  still_to_collect: { month: string; name: string; amount: number; residents: number } | null;
};

export type FinanceOverviewParams = { from?: string; to?: string; currency?: ExpenseCurrency; hostel?: string };

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  supplies: "Supplies",
  utilities: "Utilities",
  staff: "Staff & wages",
  repairs: "Repairs",
  food: "Food & kitchen",
  cleaning: "Cleaning",
  rent: "Rent & lease",
  other: "Other",
};
