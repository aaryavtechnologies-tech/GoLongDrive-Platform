import { useQuery } from '@tanstack/react-query';
import { driverService } from '@/services/driver.service';

export function useDriver(id: string) {
  return useQuery({
    queryKey: ['driver', id],
    queryFn: () => driverService.getDriverById(id),
    enabled: !!id,
  });
}

export function useDriverDocuments(id: string) {
  return useQuery({
    queryKey: ['driver-documents', id],
    queryFn: () => driverService.getDriverDocuments(id),
    enabled: !!id,
  });
}

export function useDriverRides(id: string) {
  return useQuery({
    queryKey: ['driver-rides', id],
    queryFn: () => driverService.getDriverRides(id),
    enabled: !!id,
  });
}

export function useDriverEarnings(id: string) {
  return useQuery({
    queryKey: ['driver-earnings', id],
    queryFn: () => driverService.getDriverEarnings(id),
    enabled: !!id,
  });
}

export function useDriverTimeline(id: string) {
  return useQuery({
    queryKey: ['driver-timeline', id],
    queryFn: () => driverService.getDriverTimeline(id),
    enabled: !!id,
  });
}

export function useDriverStatistics(id: string) {
  return useQuery({
    queryKey: ['driver-statistics', id],
    queryFn: () => driverService.getDriverStatistics(id),
    enabled: !!id,
  });
}
