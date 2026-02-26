/**
 * Interface representing the core Coupon object from the API
 */
export interface ICoupon {
  _id: string;
  code: string;
  discount: number;
  discount_type: "percentage" | "fixed";
  expiration_date: string;
  user: string;
  company: string;
  max_usage: number;
  min_purchase_amount: number;
  is_deleted: boolean;
  used_count: number;
  createdAt: string;
}

/**
 * Payload required to create a new coupon
 * Used in POST /coupons
 */
export interface CreateCouponPayload {
  code: string;
  discount_type: "percentage" | "fixed";
  expiration_date: string;
  max_usage: number;
  min_purchase_amount: number;
}

/**
 * Fields allowed for updating an existing coupon
 * Used in PATCH /coupons/{code}
 */
export interface UpdateCouponPayload {
  expiration_date?: string;
  max_usage?: number;
  min_purchase_amount?: number;
  is_deleted?: boolean;
}

/**
 * Generic API response wrapper for Coupon-related endpoints
 */
export interface CouponResponse<T> {
  success: boolean;
  message: string;
  data: T;
}