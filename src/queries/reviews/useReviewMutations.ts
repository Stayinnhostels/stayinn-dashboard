import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteReviewApi, patchReviewApi } from "@/api/reviews";
import { reviewKeys } from "@/queries/keys/review.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { ReviewUpdateInput } from "@/types/domain/review.types";

export function useUpdateReviewMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewUpdateInput }) => {
      if (!token) throw new Error("You must be signed in");
      return patchReviewApi(token, id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

export function useDeleteReviewMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("You must be signed in");
      return deleteReviewApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}
