import { useQuery } from "@tanstack/react-query";
import { getCouponsApi } from "@/api/coupons";
import { couponKeys } from "@/queries/keys/coupon.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

export function useCouponsQuery() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: couponKeys.list(),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in");
      return getCouponsApi(token);
    },
    enabled: Boolean(token),
  });
}
