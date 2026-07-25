import { useQuery } from '@tanstack/react-query';
import { getSystemStatus } from '@/services/settings.service';

export const useSystemStatus = (refetchInterval = 10000) => {
  const query = useQuery({
    queryKey: ['systemStatus'],
    queryFn: getSystemStatus,
    refetchInterval, // automatically refetch every 10 seconds by default
  });

  return {
    status: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};
