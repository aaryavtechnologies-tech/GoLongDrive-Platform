import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/services/audit.service';

interface UseAuditLogsProps {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
}

export const useAuditLogs = (params: UseAuditLogsProps) => {
  const query = useQuery({
    queryKey: ['auditLogs', params],
    queryFn: () => getAuditLogs(params),
    placeholderData: (previousData) => previousData, // keep previous data while fetching new page
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};
