import apiClient from '@/lib/axios';
import { PaymentFilters, RefundStatus, RevenueStats, Payment, PaymentStatus } from '@/types/payment';

export const paymentService = {
  getPayments: async (params?: PaymentFilters & { page?: number; limit?: number }) => {
    try {
      const response = await apiClient.get('/admin/payments', {
        params: {
          search: params?.search,
          status: params?.status === 'All' ? undefined : params?.status,
          method: params?.method === 'All' ? undefined : params?.method,
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      });

      const payload = response.data?.data || {};
      const rawPayments = payload.payments || [];

      // Map backend to strict frontend shape
      const mapped: Payment[] = rawPayments.map((p: any) => ({
        id: p.id || p.paymentId || p._id,
        bookingNumber: p.bookingNumber || p.booking?.bookingId || 'N/A',
        customerName: p.customerName || p.customer?.fullName || 'Customer',
        driverName: p.driverName || p.driver?.fullName || 'N/A',
        amount: Number(p.amount ?? p.totalAmount ?? 0),
        advancePaid: Number(p.advancePaid ?? (p.status === 'Paid' ? p.amount : 0)),
        remainingDue: Number(p.remainingDue ?? (p.status === 'Paid' ? 0 : p.amount)),
        paymentMethod: p.paymentMethod || 'Online',
        gateway: p.gateway || p.gatewayName || (p.paymentMethod === 'Cash' ? 'Manual' : 'Razorpay'),
        status: (p.status || p.paymentStatus || 'Pending') as PaymentStatus,
        paymentDate: p.paymentDate || p.createdAt || new Date().toISOString(),
      }));

      return {
        data: mapped,
        total: payload.total ?? mapped.length,
        page: payload.page ?? (params?.page || 1),
        limit: payload.limit ?? (params?.limit || 10),
        totalPages: payload.totalPages ?? (Math.ceil((payload.total ?? mapped.length) / (params?.limit || 10)) || 1),
      };
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      return { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
    }
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get(`/admin/payments/${id}`);
    const p = response.data?.data?.payment;
    if (!p) throw new Error('Payment not found');

    return {
      id: p.id || p.paymentId || p._id,
      bookingNumber: p.bookingNumber || p.booking?.bookingId || 'N/A',
      customerName: p.customerName || p.customer?.fullName || 'Customer',
      driverName: p.driverName || p.driver?.fullName || 'N/A',
      amount: Number(p.amount ?? 0),
      advancePaid: Number(p.advancePaid ?? (p.status === 'Paid' ? p.amount : 0)),
      remainingDue: Number(p.remainingDue ?? (p.status === 'Paid' ? 0 : p.amount)),
      paymentMethod: p.paymentMethod || 'Online',
      gateway: p.gateway || p.gatewayName || 'Razorpay',
      status: (p.status || p.paymentStatus || 'Pending') as PaymentStatus,
      paymentDate: p.paymentDate || p.createdAt || new Date().toISOString(),
    };
  },

  processRefund: async (id: string, amount?: number, reason?: string) => {
    const response = await apiClient.post(`/admin/payments/${id}/refund`, {
      amount,
      reason: reason || 'Requested via Admin Dashboard',
    });
    return response.data?.data || { success: true, id, status: 'Refunded' as RefundStatus };
  },

  getRevenueStats: async (): Promise<RevenueStats> => {
    try {
      const response = await apiClient.get('/admin/payments/stats');
      const stats = response.data?.data?.stats;
      if (stats) return stats;
    } catch (err) {
      console.warn('Could not fetch /admin/payments/stats, falling back to /payments/stats:', err);
      try {
        const fallback = await apiClient.get('/payments/stats');
        const stats = fallback.data?.data?.stats;
        if (stats) return stats;
      } catch (e) {
        console.error('Failed to fetch stats:', e);
      }
    }

    return {
      totalRevenue: 0,
      todayRevenue: 0,
      weeklyRevenue: 0,
      monthlyRevenue: 0,
      pendingPayments: 0,
      completedPayments: 0,
      refundAmount: 0,
      outstandingBalance: 0,
      driverSettlementsPending: 0,
      platformEarnings: 0,
    };
  },

  getRevenueTrends: async (): Promise<Array<{ name: string; revenue: number }>> => {
    try {
      const response = await apiClient.get('/admin/payments/trends');
      const trends = response.data?.data?.trends;
      if (Array.isArray(trends) && trends.length > 0) return trends;
    } catch (err) {
      console.warn('Could not fetch /admin/payments/trends, trying fallback:', err);
      try {
        const fallback = await apiClient.get('/payments/trends');
        const trends = fallback.data?.data?.trends;
        if (Array.isArray(trends) && trends.length > 0) return trends;
      } catch (e) {
        console.error('Failed to fetch trends:', e);
      }
    }

    const monthNames = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    return monthNames.map(name => ({ name, revenue: 0 }));
  },

  getPaymentMethodsData: async (): Promise<Array<{ name: string; value: number }>> => {
    try {
      const response = await apiClient.get('/admin/payments/methods');
      const methods = response.data?.data?.methods;
      if (Array.isArray(methods) && methods.length > 0) return methods;
    } catch (err) {
      console.warn('Could not fetch /admin/payments/methods, trying fallback:', err);
      try {
        const fallback = await apiClient.get('/payments/methods');
        const methods = fallback.data?.data?.methods;
        if (Array.isArray(methods) && methods.length > 0) return methods;
      } catch (e) {
        console.error('Failed to fetch methods breakdown:', e);
      }
    }

    return [
      { name: 'Online', value: 1 },
      { name: 'Cash', value: 0 },
      { name: 'Partial Advance', value: 0 },
    ];
  },
};
