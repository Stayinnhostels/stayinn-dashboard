import { apiFetch } from "@/api/apiFetch";
import type { Expense, ExpenseDraft } from "@/types/domain/expense.types";

type UpdateExpenseResponse = { success: boolean; expense: Expense };

export async function patchExpenseApi(token: string, id: string, input: Partial<ExpenseDraft>) {
  const data = await apiFetch<UpdateExpenseResponse>(`/api/v1/expenses/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  });
  if (!data.success || !data.expense) {
    throw new Error("Invalid update expense response");
  }
  return data.expense;
}
