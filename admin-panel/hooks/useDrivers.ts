import { useQuery } from '@tanstack/react-query';
import { driverService } from '@/services/driver.service';
import { DriverFilters } from '@/types/driver';

export function useDrivers(params?: DriverFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: () => driverService.getDrivers(params),
    placeholderData: (previousData) => previousData,
  });
}
