import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import { invoiceService } from '@/services/invoice.service';
import { earningService } from '@/services/earning.service';
import { couponService } from '@/services/coupon.service';
import { PaymentFilters } from '@/types/payment';
import { InvoiceFilters } from '@/types/invoice';
import { EarningFilters } from '@/types/earning';
import { CouponFilters } from '@/types/coupon';

// ------------------------------------
// Payments & Revenue
// ------------------------------------
export function usePayments(params?: PaymentFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentService.getPayments(params),
    placeholderData: (previousData) => previousData,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentService.getPaymentById(id),
    enabled: !!id,
  });
}

export function useRevenueStats() {
  return useQuery({
    queryKey: ['revenue-stats'],
    queryFn: () => paymentService.getRevenueStats(),
    refetchInterval: 30000, // Poll every 30s
  });
}

export function useRevenueTrends() {
  return useQuery({
    queryKey: ['revenue-trends'],
    queryFn: () => paymentService.getRevenueTrends(),
  });
}

export function usePaymentMethodsData() {
  return useQuery({
    queryKey: ['payment-methods-data'],
    queryFn: () => paymentService.getPaymentMethodsData(),
  });
}

// ------------------------------------
// Invoices
// ------------------------------------
export function useInvoices(params?: InvoiceFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoiceService.getInvoices(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getInvoiceById(id),
    enabled: !!id,
  });
}

// ------------------------------------
// Earnings
// ------------------------------------
export function useDriverEarnings(params?: EarningFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['earnings', params],
    queryFn: () => earningService.getEarnings(params),
    placeholderData: (previousData) => previousData,
  });
}

// ------------------------------------
// Coupons
// ------------------------------------
export function useCoupons(params?: CouponFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['coupons', params],
    queryFn: () => couponService.getCoupons(params),
    placeholderData: (previousData) => previousData,
  });
}
