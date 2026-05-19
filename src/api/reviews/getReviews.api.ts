import { apiFetch } from "@/api/apiFetch";
import type { Review, ReviewListParams, ReviewStats } from "@/types/domain/review.types";

type ListReviewsResponse = {
  success: boolean;
  reviews: Review[];
  stats: ReviewStats;
};

export async function getReviewsApi(token: string, params: ReviewListParams = {}) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);

  const q = search.toString();
  const data = await apiFetch<ListReviewsResponse>(`/api/v1/reviews${q ? `?${q}` : ""}`, { token });
  if (!data.success || !Array.isArray(data.reviews)) {
    throw new Error("Invalid reviews list response");
  }
  return { reviews: data.reviews, stats: data.stats };
}
