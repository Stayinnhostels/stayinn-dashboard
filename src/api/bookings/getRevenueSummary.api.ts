import { apiFetch } from "@/api/apiFetch";
import type { RevenueSummary } from "@/types/domain/payment.types";

type GetRevenueSummaryResponse = {
  success: boolean;
  revenue: RevenueSummary;
};

export async function getRevenueSummaryApi(token: string) {
  const data = await apiFetch<GetRevenueSummaryResponse>("/api/v1/bookings/stats/revenue", {
    token,
  });
  if (!data.success || !data.revenue) {
    throw new Error("Invalid revenue summary response");
  }
  return data.revenue;
}
