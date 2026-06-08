import { apiFetch } from "@/api/apiFetch";

export async function deleteExpenseApi(token: string, id: string) {
  await apiFetch<{ success: boolean }>(`/api/v1/expenses/${id}`, {
    method: "DELETE",
    token,
  });
}
