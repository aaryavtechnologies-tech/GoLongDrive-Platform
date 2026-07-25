import apiClient from '@/lib/axios';
import { AuditLogsResponse } from '@/types/audit-log';

interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  module?: string;
  startDate?: string;
  endDate?: string;
}

export const getAuditLogs = async (params: GetAuditLogsParams): Promise<AuditLogsResponse> => {
  const response = await apiClient.get('/admin/audit-logs', { params });
  return response.data.data;
};
