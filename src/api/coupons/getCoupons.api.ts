import { apiFetch } from "@/api/apiFetch";
import type { CouponsResponse } from "@/types/domain/coupon.types";

type Response = { success: boolean } & CouponsResponse;

export async function getCouponsApi(token: string): Promise<CouponsResponse> {
  const data = await apiFetch<Response>("/api/v1/coupons", { token });
  if (!data.success || !Array.isArray(data.coupons)) {
    throw new Error("Invalid coupons response");
  }
  return {
    coupons: data.coupons,
    counts: data.counts ?? { all: data.coupons.length, active: 0, scheduled: 0, ended: 0, paused: 0 },
    stats: data.stats ?? { active: 0, next_scheduled: null, scheduled: 0, used_this_month: 0, bookings_this_month: 0, discount_this_month: { pkr: 0, usd: 0 }, best: null },
  };
}
