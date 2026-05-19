import { useQuery } from "@tanstack/react-query";
import { getReviewStatsApi } from "@/api/reviews";
import { reviewKeys } from "@/queries/keys/review.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

export function useReviewStatsQuery() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: [...reviewKeys.all, "stats"] as const,
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getReviewStatsApi(token);
    },
    enabled: Boolean(token),
    staleTime: 30_000,
  });
}
