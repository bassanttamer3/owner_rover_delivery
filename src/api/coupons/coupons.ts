import API_ECOMMERCE from "../ecommerce-base-api";
import { 
  ICoupon, 
  CreateCouponPayload, 
  UpdateCouponPayload, 
  CouponResponse,
} from "@/common/interfaces/coupons/coupons.interface";

/**
 * Get all coupons for a specific company
 * GET /coupons
 */
export function listCoupons(companyId?: string) {
  return API_ECOMMERCE.get<CouponResponse<ICoupon[]>>('/coupons', {
    params: { company_id: companyId }
  });
}

/**
 * Create a new promotional coupon
 * POST /coupons
 */
export function createCoupon(data: CreateCouponPayload) {
  return API_ECOMMERCE.post<CouponResponse<ICoupon>>('/coupons', data);
}

/**
 * Update limited fields of an existing coupon by its code
 * PATCH /coupons/{code}
 */
export function updateCoupon(code: string, data: UpdateCouponPayload) {
  return API_ECOMMERCE.patch<CouponResponse<ICoupon>>(`/coupons/${code}`, data);
}


