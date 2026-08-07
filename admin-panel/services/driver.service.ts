import apiClient from '@/lib/axios';
import { 
  Driver, 
  DriverDocument, 
  DriverEarningSummary, 
  DriverRideSummary, 
  DriverTimelineEvent, 
  DriverApprovalStatus,
  DocumentStatus
} from '@/types/driver';

// Mock Data for sub-details removed in favor of real endpoints

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const driverService = {
  getDrivers: async (params?: any) => {
    try {
      const response = await apiClient.get('/admin/drivers', { params });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      return { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
    }
  },

  getDriverById: async (id: string) => {
    const response = await apiClient.get(`/admin/drivers/${id}`);
    return response.data.data;
  },

  createDriver: async (data: any) => {
    const response = await apiClient.post('/admin/drivers', data);
    return response.data.data;
  },

  updateDriverStatus: async (id: string, status: DriverApprovalStatus) => {
    const response = await apiClient.patch(`/admin/drivers/${id}/status`, { status });
    return response.data;
  },

  deleteDriver: async (id: string) => {
    await delay(600);
    return { success: true, id };
  },

  getDriverDocuments: async (id: string) => {
    const response = await apiClient.get(`/admin/drivers/${id}/documents`);
    return response.data.data;
  },

  updateDocumentStatus: async (driverId: string, docId: string, status: DocumentStatus, notes?: string) => {
    await delay(500);
    return { success: true, driverId, docId, status, notes };
  },

  getDriverRides: async (id: string) => {
    const response = await apiClient.get(`/admin/drivers/${id}/rides`);
    return response.data.data;
  },

  getDriverEarnings: async (id: string) => {
    const response = await apiClient.get(`/admin/drivers/${id}/earnings`);
    return response.data.data;
  },
  
  getDriverTimeline: async (id: string) => {
    const response = await apiClient.get(`/admin/drivers/${id}/timeline`);
    return response.data.data;
  },
  
  getDriverStatistics: async (id: string) => {
    const response = await apiClient.get(`/admin/drivers/${id}/statistics`);
    return response.data.data;
  }
};
