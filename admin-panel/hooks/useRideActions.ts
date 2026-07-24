import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rideService } from '@/services/ride.service';
import { RideStatus } from '@/types/ride';
import { toast } from 'sonner';

export function useUpdateRideStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RideStatus }) => 
      rideService.updateRideStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['ride', data.id] });
      queryClient.invalidateQueries({ queryKey: ['ride-timeline', data.id] });
      toast.success(`Ride status updated to ${data.status}`);
    },
    onError: () => {
      toast.error('Failed to update ride status');
    }
  });
}

export function useAssignDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rideId, driver }: { rideId: string; driver: any }) => 
      rideService.assignDriver(rideId, driver),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['ride', data.rideId] });
      queryClient.invalidateQueries({ queryKey: ['ride-timeline', data.rideId] });
      toast.success('Driver assigned successfully');
    },
    onError: () => {
      toast.error('Failed to assign driver');
    }
  });
}

export function useCancelRide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rideId, reason }: { rideId: string; reason: string }) => 
      rideService.cancelRide(rideId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['ride', data.rideId] });
      queryClient.invalidateQueries({ queryKey: ['ride-timeline', data.rideId] });
      toast.success('Ride cancelled successfully');
    },
    onError: () => {
      toast.error('Failed to cancel ride');
    }
  });
}
