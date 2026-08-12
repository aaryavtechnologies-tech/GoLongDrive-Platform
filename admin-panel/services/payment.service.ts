import apiClient from '@/lib/axios';
import { PaymentFilters, RefundStatus, RevenueStats, PaymentStatus } from '@/types/payment';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentService = {
  getPayments: async (params?: any) => {
    try {
      // The backend doesn't support pagination on payments natively yet, so we fetch all and paginate client side
      const response = await apiClient.get('/admin/payments/all');
      let payments = response.data.data.payments || [];
      
      // Map backend to frontend shape
      let mapped = payments.map((p: any) => ({
        id: p._id,
        transactionId: p.paymentId || p._id,
        date: p.createdAt,
        customer: {
          id: p.customer?._id || 'N/A',
          name: p.customer?.fullName || 'Unknown',
          email: p.customer?.email || 'N/A',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.customer?.fullName || 'U')}&background=random`
        },
        bookingNumber: p.booking?.bookingId || p.booking?._id || 'N/A',
        amount: p.advanceAmount || p.totalAmount || 0, // Using advanceAmount for partials, else total
        method: p.paymentMethod || 'Online',
        status: p.paymentStatus === 'Completed' || p.paymentStatus === 'Paid' || p.paymentStatus === 'Advance Paid' ? 'Successful' : p.paymentStatus === 'Failed' ? 'Failed' : p.paymentStatus === 'Refunded' ? 'Refunded' : 'Pending',
        type: 'Ride Fare',
        breakdown: {
          baseFare: p.totalAmount || 0,
          taxes: 0,
          discount: 0,
          total: p.totalAmount || 0
        }
      }));
      
      if (params?.search) {
        const s = params.search.toLowerCase();
        mapped = mapped.filter((p: any) => 
          p.transactionId.toLowerCase().includes(s) || 
          p.customer.name.toLowerCase().includes(s) ||
          p.bookingNumber.toLowerCase().includes(s)
        );
      }
      
      if (params?.status && params.status !== 'All') {
        mapped = mapped.filter((p: any) => p.status === params.status);
      }
      
      if (params?.method && params.method !== 'All') {
        mapped = mapped.filter((p: any) => p.method === params.method);
      }
      
      if (params?.date) {
        mapped = mapped.filter((p: any) => p.date.startsWith(params.date));
      }
  
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const start = (page - 1) * limit;
      const paginated = mapped.slice(start, start + limit);
      
      return {
        data: paginated,
        total: mapped.length,
        page,
        limit,
        totalPages: Math.ceil(mapped.length / limit)
      };
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      return { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
    }
  },

  getPaymentById: async (id: string) => {
    // For simplicity, fetch all and find
    const response = await apiClient.get('/admin/payments/all');
    let payments = response.data.data.payments || [];
    const p = payments.find((pay: any) => pay._id === id);
    if (!p) throw new Error('Payment not found');
    
    return {
      id: p._id,
      transactionId: p.paymentId || p._id,
      date: p.createdAt,
      customer: {
        id: p.customer?._id || 'N/A',
        name: p.customer?.fullName || 'Unknown',
        email: p.customer?.email || 'N/A',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(p.customer?.fullName || 'U')}&background=random`
      },
      bookingNumber: p.booking?.bookingId || p.booking?._id || 'N/A',
      amount: p.advanceAmount || p.totalAmount || 0,
      method: p.paymentMethod || 'Online',
      status: p.paymentStatus === 'Completed' || p.paymentStatus === 'Paid' || p.paymentStatus === 'Advance Paid' ? 'Successful' : p.paymentStatus === 'Failed' ? 'Failed' : p.paymentStatus === 'Refunded' ? 'Refunded' : 'Pending',
      type: 'Ride Fare',
      breakdown: {
        baseFare: p.totalAmount || 0,
        taxes: 0,
        discount: 0,
        total: p.totalAmount || 0
      }
    };
  },

  processRefund: async (id: string, amount: number, reason: string) => {
    await delay(1000);
    return { success: true, id, status: 'Refunded' as RefundStatus };
  },

  getRevenueStats: async (): Promise<any> => {
    await delay(300);
    return {
      totalRevenue: 1250000,
      todayRevenue: 45000,
      weeklyRevenue: 320000,
      monthlyRevenue: 1450000,
      pendingPayments: 42,
      completedPayments: 1250,
      refundAmount: 15000,
      outstandingBalance: 125000,
      driverSettlementsPending: 340,
      platformEarnings: 1250000 * 0.15 
    };
  },

  // Mock data for Recharts
  getRevenueTrends: async () => {
    await delay(400);
    return [
      { name: 'Jan', revenue: 120000 },
      { name: 'Feb', revenue: 145000 },
      { name: 'Mar', revenue: 110000 },
      { name: 'Apr', revenue: 175000 },
      { name: 'May', revenue: 190000 },
      { name: 'Jun', revenue: 230000 },
    ];
  },
  
  getPaymentMethodsData: async () => {
    await delay(400);
    return [
      { name: 'Online', value: 65 },
      { name: 'Cash', value: 20 },
      { name: 'Partial Advance', value: 15 }
    ];
  }
};
