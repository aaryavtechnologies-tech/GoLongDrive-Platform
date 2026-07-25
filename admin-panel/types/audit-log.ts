import { AdminUser } from './admin-user';

export interface AuditLog {
  _id: string;
  admin: AdminUser | string;
  action: string;
  module: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  endpoint?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
