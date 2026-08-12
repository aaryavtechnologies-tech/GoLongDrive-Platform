export type PaymentStatus = 'Pending' | 'Advance Paid' | 'Paid' | 'Refunded' | 'Partially Refunded' | 'Failed';
export type RefundStatus = 'Pending' | 'Processed' | 'Failed' | 'Refunded';

export type PaymentMethod = 'Cash' | 'Online' | 'Partial Advance' | 'Future Ready';

export type PaymentGateway = 'Razorpay' | 'Stripe' | 'Cashfree' | 'Manual';

export interface Payment {
  id: string;
  bookingNumber: string;
  customerName: string;
  driverName?: string;
  amount: number;
  advancePaid: number;
  remainingDue: number;
  paymentMethod: PaymentMethod;
  gateway: PaymentGateway;
  status: PaymentStatus;
  paymentDate: string;
}

export interface PaymentFilters {
  search?: string;
  status?: PaymentStatus | 'All';
  method?: PaymentMethod | 'All';
  dateRange?: string;
}

export interface RevenueStats {
  totalRevenue: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  refundAmount: number;
  outstandingBalance: number;
  driverSettlementsPending: number;
  platformEarnings: number;
}
