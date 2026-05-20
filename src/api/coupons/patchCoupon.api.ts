import { apiFetch } from "@/api/apiFetch";
import type { Coupon, CouponInput } from "@/types/domain/coupon.types";

type Response = { success: boolean; coupon: Coupon };

export async function patchCouponApi(token: string, id: string, input: Partial<CouponInput>) {
  const data = await apiFetch<Response>(`/api/v1/coupons/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!data.success || !data.coupon) throw new Error("Failed to update coupon");
  return data.coupon;
}
