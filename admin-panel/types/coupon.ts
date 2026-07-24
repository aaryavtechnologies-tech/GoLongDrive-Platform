export type DiscountType = 'Flat' | 'Percentage';
export type CouponStatus = 'Active' | 'Inactive' | 'Expired';

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minBookingAmount?: number;
  usageLimit?: number; // Total usages allowed
  usageCount: number;  // Current usages
  usagePerCustomer?: number;
  startDate: string;
  expiryDate: string;
  status: CouponStatus;
}

export interface CouponFilters {
  search?: string;
  status?: CouponStatus | 'All';
}
