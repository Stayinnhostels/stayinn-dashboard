import { apiFetch } from "@/api/apiFetch";

export async function deleteCouponApi(token: string, id: string) {
  await apiFetch<{ success: boolean }>(`/api/v1/coupons/${id}`, {
    token,
    method: "DELETE",
  });
}
