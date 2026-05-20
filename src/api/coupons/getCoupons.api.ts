import { apiFetch } from "@/api/apiFetch";
import type { Coupon } from "@/types/domain/coupon.types";

type Response = { success: boolean; coupons: Coupon[] };

export async function getCouponsApi(token: string) {
  const data = await apiFetch<Response>("/api/v1/coupons", { token });
  if (!data.success || !Array.isArray(data.coupons)) {
    throw new Error("Invalid coupons response");
  }
  return data.coupons;
}
