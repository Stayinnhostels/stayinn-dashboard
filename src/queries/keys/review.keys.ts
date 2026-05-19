import type { ReviewListParams } from "@/types/domain/review.types";

export const reviewKeys = {
  all: ["reviews"] as const,
  list: (params: ReviewListParams) => [...reviewKeys.all, "list", params] as const,
};
