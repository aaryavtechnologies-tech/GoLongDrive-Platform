import { Payment, PaymentFilters, RevenueStats, PaymentStatus } from '@/types/payment';

const mockPayments: Payment[] = [
  {
    id: 'PAY-8001',
    bookingNumber: 'BKG-59302',
    customerName: 'Alice Smith',
    driverName: 'Rajesh Kumar',
    amount: 1500,
    advancePaid: 500,
    remainingDue: 0,
    paymentMethod: 'Online',
    gateway: 'Razorpay',
    status: 'Paid',
    paymentDate: '2024-05-15T09:15:00Z'
  },
  {
    id: 'PAY-8002',
    bookingNumber: 'BKG-59303',
    customerName: 'Bob Johnson',
    amount: 1130,
    advancePaid: 300,
    remainingDue: 830,
    paymentMethod: 'Partial Advance',
    gateway: 'Stripe',
    status: 'Advance Paid',
    paymentDate: '2024-06-18T14:20:00Z'
  },
  {
    id: 'PAY-8003',
    bookingNumber: 'BKG-59304',
    customerName: 'Charlie Davis',
    driverName: 'Amit Sharma',
    amount: 8700,
    advancePaid: 2000,
    remainingDue: 6700,
    paymentMethod: 'Cash',
    gateway: 'Manual',
    status: 'Pending',
    paymentDate: '2024-06-25T06:15:00Z'
  },
  {
    id: 'PAY-8004',
    bookingNumber: 'BKG-59305',
    customerName: 'David Lee',
    driverName: 'Vikram Singh',
    amount: 2500,
    advancePaid: 2500,
    remainingDue: 0,
    paymentMethod: 'Online',
    gateway: 'Cashfree',
    status: 'Refunded',
    paymentDate: '2024-06-22T10:00:00Z'
  }
];

let mutableMockPayments = [...mockPayments];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const paymentService = {
  getPayments: async (params?: PaymentFilters & { page?: number; limit?: number }) => {
    await delay(600);
    let filtered = [...mutableMockPayments];
    
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.id.toLowerCase().includes(s) || 
        p.bookingNumber.toLowerCase().includes(s) ||
        p.customerName.toLowerCase().includes(s)
      );
    }
    
    if (params?.status && params.status !== 'All') {
      filtered = filtered.filter(p => p.status === params.status);
    }
    
    if (params?.method && params.method !== 'All') {
      filtered = filtered.filter(p => p.paymentMethod === params.method);
    }
    
    filtered.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

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

  getPaymentById: async (id: string) => {
    await delay(400);
    const payment = mutableMockPayments.find(p => p.id === id);
    if (!payment) throw new Error('Payment not found');
    return payment;
  },

  refundPayment: async (id: string) => {
    await delay(800);
    const paymentIndex = mutableMockPayments.findIndex(p => p.id === id);
    if (paymentIndex !== -1) {
      mutableMockPayments[paymentIndex].status = 'Refunded';
    }
    return { success: true, id, status: 'Refunded' as PaymentStatus };
  },

  getRevenueStats: async (): Promise<RevenueStats> => {
    await delay(300);
    // Calculated dynamically for realism
    const totalRevenue = mutableMockPayments.filter(p => p.status === 'Paid' || p.status === 'Advance Paid').reduce((acc, p) => acc + (p.status === 'Paid' ? p.amount : p.advancePaid), 0);
    const refundAmount = mutableMockPayments.filter(p => p.status === 'Refunded').reduce((acc, p) => acc + p.amount, 0);
    const pendingPayments = mutableMockPayments.filter(p => p.status === 'Pending').length;
    
    return {
      totalRevenue: totalRevenue + 1250000, // Seed with base
      todayRevenue: 45000,
      weeklyRevenue: 320000,
      monthlyRevenue: 1450000,
      pendingPayments: pendingPayments + 42,
      completedPayments: mutableMockPayments.filter(p => p.status === 'Paid').length + 1250,
      refundAmount: refundAmount + 15000,
      outstandingBalance: 125000,
      driverSettlementsPending: 340,
      platformEarnings: (totalRevenue + 1250000) * 0.15 // Assume 15% overall cut
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
