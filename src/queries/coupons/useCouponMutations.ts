import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCouponApi, patchCouponApi, postCouponApi } from "@/api/coupons";
import { couponKeys } from "@/queries/keys/coupon.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { CouponInput } from "@/types/domain/coupon.types";

export function useCreateCouponMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CouponInput) => {
      if (!token) throw new Error("You must be signed in");
      return postCouponApi(token, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.all });
    },
  });
}

export function useUpdateCouponMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CouponInput> }) => {
      if (!token) throw new Error("You must be signed in");
      return patchCouponApi(token, id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.all });
    },
  });
}

export function useDeleteCouponMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("You must be signed in");
      return deleteCouponApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.all });
    },
  });
}
