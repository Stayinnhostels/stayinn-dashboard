import { apiFetch } from "@/api/apiFetch";

export async function deleteReviewApi(token: string, id: string) {
  await apiFetch<{ success: boolean }>(`/api/v1/reviews/${id}`, {
    token,
    method: "DELETE",
  });
}
