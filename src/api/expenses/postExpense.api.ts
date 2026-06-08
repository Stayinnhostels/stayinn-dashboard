import { apiFetch } from "@/api/apiFetch";
import type { Expense, ExpenseDraft } from "@/types/domain/expense.types";

type CreateExpenseResponse = { success: boolean; expense: Expense };

export async function postExpenseApi(token: string, input: ExpenseDraft) {
  const data = await apiFetch<CreateExpenseResponse>("/api/v1/expenses", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
  if (!data.success || !data.expense) {
    throw new Error("Invalid create expense response");
  }
  return data.expense;
}
