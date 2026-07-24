import { useQuery } from '@tanstack/react-query';
import { rideService } from '@/services/ride.service';

export function useRide(id: string) {
  return useQuery({
    queryKey: ['ride', id],
    queryFn: () => rideService.getRideById(id),
    enabled: !!id,
  });
}

export function useRideTimeline(id: string) {
  return useQuery({
    queryKey: ['ride-timeline', id],
    queryFn: () => rideService.getRideTimeline(id),
    enabled: !!id,
    refetchInterval: 5000, // Simulate real-time polling for timeline
  });
}
