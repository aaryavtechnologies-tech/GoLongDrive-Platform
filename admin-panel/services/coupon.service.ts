import apiClient from '@/lib/axios';
import {
  Coupon,
  CouponFilters,
  CouponStatus,
  CouponDetailsResponse,
} from '@/types/coupon';

export interface PaginatedCouponsResponse {
  data: Coupon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const couponService = {
  getCoupons: async (
    params?: CouponFilters & { page?: number; limit?: number }
  ): Promise<PaginatedCouponsResponse> => {
    try {
      const response = await apiClient.get('/coupons', {
        params: {
          search: params?.search,
          status: params?.status === 'All' ? undefined : params?.status,
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      });

      const payload = response.data?.data || {};
      const coupons: Coupon[] = payload.coupons || [];

      return {
        data: coupons,
        total: payload.total ?? coupons.length,
        page: payload.page ?? 1,
        limit: payload.limit ?? 10,
        totalPages: payload.totalPages ?? 1,
      };
    } catch (error: any) {
      console.error('Failed to fetch coupons from server:', error);
      throw error;
    }
  },

  getCouponById: async (id: string): Promise<CouponDetailsResponse> => {
    const response = await apiClient.get(`/coupons/${id}`);
    const data = response.data?.data;
    if (!data) {
      throw new Error('Failed to retrieve coupon details');
    }
    return data as CouponDetailsResponse;
  },

  createCoupon: async (
    data: Omit<Coupon, 'id' | 'usageCount'>
  ): Promise<Coupon> => {
    const response = await apiClient.post('/coupons', {
      code: data.code,
      title: data.title,
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxDiscount: data.maxDiscount,
      minBookingAmount: data.minBookingAmount,
      usageLimit: data.usageLimit,
      usagePerCustomer: data.usagePerCustomer,
      startDate: data.startDate,
      expiryDate: data.expiryDate,
      status: data.status,
    });
    return response.data?.data?.coupon;
  },

  updateCoupon: async (
    id: string,
    data: Partial<Coupon>
  ): Promise<Coupon> => {
    const response = await apiClient.put(`/coupons/${id}`, {
      code: data.code,
      title: data.title,
      description: data.description,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxDiscount: data.maxDiscount,
      minBookingAmount: data.minBookingAmount,
      usageLimit: data.usageLimit,
      usagePerCustomer: data.usagePerCustomer,
      startDate: data.startDate,
      expiryDate: data.expiryDate,
      status: data.status,
    });
    return response.data?.data?.coupon;
  },

  updateCouponStatus: async (
    id: string,
    status: CouponStatus
  ): Promise<{ success: boolean; id: string; status: CouponStatus }> => {
    await apiClient.put(`/coupons/${id}`, { status });
    return { success: true, id, status };
  },

  deleteCoupon: async (id: string): Promise<{ success: boolean }> => {
    await apiClient.delete(`/coupons/${id}`);
    return { success: true };
  },
};
