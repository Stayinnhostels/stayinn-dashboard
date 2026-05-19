import { useQuery } from "@tanstack/react-query";
import { getReviewsApi } from "@/api/reviews";
import { reviewKeys } from "@/queries/keys/review.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { ReviewListParams } from "@/types/domain/review.types";

export function useReviewsQuery(params: ReviewListParams = {}) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view reviews");
      return getReviewsApi(token, params);
    },
    enabled: Boolean(token),
    staleTime: 30_000,
  });
}
