import { apiFetch } from "@/api/apiFetch";
import type { Review, ReviewUpdateInput } from "@/types/domain/review.types";

type PatchReviewResponse = {
  success: boolean;
  review: Review;
};

export async function patchReviewApi(token: string, id: string, input: ReviewUpdateInput) {
  const data = await apiFetch<PatchReviewResponse>(`/api/v1/reviews/${id}`, {
    token,
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!data.success || !data.review) {
    throw new Error("Invalid review update response");
  }
  return data.review;
}
