export type CouponDiscountType = "percent" | "fixed";
export type CouponAppliesTo = "first_month" | "every_month" | "deposit";
/** Figma 15.04 tags. "Ended" filter = used_up + expired. */
export type CouponStatus = "active" | "scheduled" | "used_up" | "expired" | "paused";

export type Coupon = {
  id: string;
  hostel_id?: string | null;
  hostel_name?: string | null;
  code: string;
  description: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  /** null = no limit */
  max_uses: number | null;
  used: number;
  max_discount: number | null;
  uses_per_guest: number | null;
  applies_to: CouponAppliesTo;
  /** YYYY-MM-DD or null (starts straight away) */
  valid_from: string | null;
  /** YYYY-MM-DD or null (no end date) */
  valid_until: string | null;
  active: boolean;
  status: CouponStatus;
  bookings_count: number;
  discount_given: number;
  created_at: string | null;
  updated_at?: string | null;
};

export type CouponInput = {
  code: string;
  description?: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  max_uses: number | null;
  max_discount?: number | null;
  uses_per_guest?: number | null;
  applies_to?: CouponAppliesTo;
  valid_from?: string | null;
  valid_until: string | null;
  active?: boolean;
};

export type CouponCounts = { all: number; active: number; scheduled: number; ended: number; paused: number };

export type CouponStats = {
  active: number;
  next_scheduled: { code: string; starts: string } | null;
  scheduled: number;
  used_this_month: number;
  bookings_this_month: number;
  discount_this_month: { pkr: number; usd: number };
  best: { code: string; bookings: number } | null;
};

export type CouponsResponse = { coupons: Coupon[]; counts: CouponCounts; stats: CouponStats };
