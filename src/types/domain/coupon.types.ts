export type CouponDiscountType = "percent" | "fixed";

export type Coupon = {
  id: string;
  hostel_id?: string | null;
  hostel_name?: string | null;
  code: string;
  description: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  max_uses: number;
  used: number;
  valid_until: string;
  active: boolean;
  created_at: string | null;
  updated_at?: string | null;
};

export type CouponInput = {
  code: string;
  description?: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  max_uses: number;
  valid_until: string;
  active?: boolean;
};
