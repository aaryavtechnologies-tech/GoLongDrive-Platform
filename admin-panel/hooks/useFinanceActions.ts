import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import { earningService } from '@/services/earning.service';
import { couponService } from '@/services/coupon.service';
import { Coupon, CouponStatus } from '@/types/coupon';
import { toast } from 'sonner';

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentService.processRefund(id, 0, 'Requested via Admin'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['revenue-stats'] });
      toast.success('Payment refunded successfully');
    },
    onError: () => {
      toast.error('Failed to refund payment');
    }
  });
}

export function useSettleEarning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => earningService.settleEarnings(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-stats'] });
      toast.success('Earnings settled successfully');
    },
    onError: () => {
      toast.error('Failed to settle earnings');
    }
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Coupon, 'id' | 'usageCount'>) => couponService.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon created successfully');
    },
    onError: () => {
      toast.error('Failed to create coupon');
    }
  });
}

export function useUpdateCouponStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CouponStatus }) => couponService.updateCouponStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success(`Coupon marked as ${data.status}`);
    },
    onError: () => {
      toast.error('Failed to update coupon status');
    }
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete coupon');
    }
  });
}
