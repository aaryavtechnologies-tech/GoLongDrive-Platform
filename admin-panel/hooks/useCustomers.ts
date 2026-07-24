import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/services/customer.service';
import { CustomerFilters } from '@/types/customer';

export function useCustomers(params?: CustomerFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerService.getCustomers(params),
    placeholderData: (previousData) => previousData, // keep previous data while fetching new (useful for pagination/filtering)
  });
}
