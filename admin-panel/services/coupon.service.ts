import { Coupon, CouponFilters, CouponStatus } from '@/types/coupon';

const mockCoupons: Coupon[] = [
  {
    id: 'CPN-001',
    code: 'WELCOME50',
    title: 'New User Discount',
    description: 'Flat 50 discount for first time users',
    discountType: 'Flat',
    discountValue: 50,
    minBookingAmount: 500,
    usageLimit: 1000,
    usageCount: 450,
    usagePerCustomer: 1,
    startDate: '2024-01-01T00:00:00Z',
    expiryDate: '2024-12-31T23:59:59Z',
    status: 'Active'
  },
  {
    id: 'CPN-002',
    code: 'SUMMER20',
    title: 'Summer Vacation Offer',
    description: '20% off on outstation rides',
    discountType: 'Percentage',
    discountValue: 20,
    maxDiscount: 1000,
    minBookingAmount: 2000,
    usageCount: 120,
    startDate: '2024-04-01T00:00:00Z',
    expiryDate: '2024-06-30T23:59:59Z',
    status: 'Expired'
  }
];

let mutableMockCoupons = [...mockCoupons];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const couponService = {
  getCoupons: async (params?: CouponFilters & { page?: number; limit?: number }) => {
    await delay(600);
    let filtered = [...mutableMockCoupons];
    
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter((c: any) => 
        c.code.toLowerCase().includes(s) || 
        c.title.toLowerCase().includes(s)
      );
    }
    
    if (params?.status && params.status !== 'All') {
      filtered = filtered.filter((c: any) => c.status === params.status);
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    return {
      data: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    };
  },

  createCoupon: async (data: Omit<Coupon, 'id' | 'usageCount'>) => {
    await delay(800);
    const newCoupon: Coupon = {
      ...data,
      id: `CPN-00${mutableMockCoupons.length + 1}`,
      usageCount: 0
    };
    mutableMockCoupons.unshift(newCoupon);
    return newCoupon;
  },

  updateCouponStatus: async (id: string, status: CouponStatus) => {
    await delay(500);
    const index = mutableMockCoupons.findIndex(c => c.id === id);
    if (index !== -1) {
      mutableMockCoupons[index].status = status;
    }
    return { success: true, id, status };
  },
  
  deleteCoupon: async (id: string) => {
    await delay(600);
    mutableMockCoupons = mutableMockCoupons.filter((c: any) => c.id !== id);
    return { success: true };
  }
};
