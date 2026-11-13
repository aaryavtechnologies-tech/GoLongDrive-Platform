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
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponUsage {
  id: string;
  bookingId: string;
  bookingMongoId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  bookingAmount: number;
  discountAmount: number;
  bookingStatus?: string;
  usedAt: string;
}

export interface CouponStats {
  usageCount: number;
  usageLimit: number | null;
  remainingUses: number | null;
  totalDiscountGiven: number;
  totalBookingVolume: number;
  uniqueCustomersCount: number;
}

export interface CouponDetailsResponse {
  coupon: Coupon;
  usages: CouponUsage[];
  stats: CouponStats;
}

export interface CouponFilters {
  search?: string;
  status?: CouponStatus | 'All';
}
