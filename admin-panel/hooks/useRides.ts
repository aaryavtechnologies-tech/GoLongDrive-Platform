import { useQuery } from '@tanstack/react-query';
import { rideService } from '@/services/ride.service';
import { RideFilters } from '@/types/ride';

export function useRides(params?: RideFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['rides', params],
    queryFn: () => rideService.getRides(params),
    placeholderData: (previousData) => previousData,
  });
}
