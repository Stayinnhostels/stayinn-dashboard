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
  page?: number;
  limit?: number;
};

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
