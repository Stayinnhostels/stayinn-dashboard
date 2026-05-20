export const couponKeys = {
  all: ["coupons"] as const,
  list: () => [...couponKeys.all, "list"] as const,
};
