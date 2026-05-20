import { apiFetch } from "@/api/apiFetch";
import type { Coupon, CouponInput } from "@/types/domain/coupon.types";

type Response = { success: boolean; coupon: Coupon };

export async function postCouponApi(token: string, input: CouponInput) {
  const data = await apiFetch<Response>("/api/v1/coupons", {
    token,
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!data.success || !data.coupon) throw new Error("Failed to create coupon");
  return data.coupon;
}
