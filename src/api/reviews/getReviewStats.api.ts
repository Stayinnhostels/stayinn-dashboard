import { apiFetch } from "@/api/apiFetch";
import type { ReviewStats } from "@/types/domain/review.types";

type ReviewStatsResponse = {
  success: boolean;
  stats: ReviewStats;
};

export async function getReviewStatsApi(token: string) {
  const data = await apiFetch<ReviewStatsResponse>("/api/v1/reviews/stats", { token });
  if (!data.success || !data.stats) {
    throw new Error("Invalid review stats response");
  }
  return data.stats;
}
