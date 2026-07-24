import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/services/customer.service';

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getCustomerById(id),
    enabled: !!id,
  });
}

export function useCustomerBookings(id: string) {
  return useQuery({
    queryKey: ['customer-bookings', id],
    queryFn: () => customerService.getCustomerBookings(id),
    enabled: !!id,
  });
}

export function useCustomerPayments(id: string) {
  return useQuery({
    queryKey: ['customer-payments', id],
    queryFn: () => customerService.getCustomerPayments(id),
    enabled: !!id,
  });
}

export function useCustomerTimeline(id: string) {
  return useQuery({
    queryKey: ['customer-timeline', id],
    queryFn: () => customerService.getCustomerTimeline(id),
    enabled: !!id,
  });
}
