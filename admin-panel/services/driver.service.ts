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

// Mock Data for sub-details
const mockDocuments: DriverDocument[] = [
  { id: 'DOC-1', type: 'Profile Photo', url: 'https://picsum.photos/400/300?random=1', status: 'Approved', uploadedAt: '2023-01-10T10:05:00Z', reviewedBy: 'Admin', reviewedAt: '2023-01-10T11:00:00Z' },
  { id: 'DOC-3', type: 'Driving License Front', url: 'https://picsum.photos/400/300?random=3', status: 'Pending', uploadedAt: '2023-01-10T10:15:00Z' },
];

const mockRides: DriverRideSummary[] = [
  { id: 'RD-2001', pickup: 'Marine Drive', destination: 'Airport', customer: 'Alice Smith', tripType: 'Airport Drop', date: '2023-10-12T08:00:00Z', fare: 1500, status: 'Completed' },
];

const mockEarnings: DriverEarningSummary[] = [
  { id: 'ERN-3001', rideId: 'RD-2001', fare: 1500, commission: 300, driverEarning: 1200, paymentStatus: 'Paid', settlementStatus: 'Settled', date: '2023-10-12T08:00:00Z' },
];

const mockTimeline: DriverTimelineEvent[] = [
  { id: 'TL-1', type: 'registered', title: 'Driver Registered', description: 'Account created', date: '2023-01-10T10:00:00Z' },
];

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
    await delay(600);
    return { success: true, id, status };
  },

  deleteDriver: async (id: string) => {
    await delay(600);
    return { success: true, id };
  },

  getDriverDocuments: async (id: string) => {
    await delay(600);
    return mockDocuments;
  },

  updateDocumentStatus: async (driverId: string, docId: string, status: DocumentStatus, notes?: string) => {
    await delay(500);
    return { success: true, driverId, docId, status, notes };
  },

  getDriverRides: async (id: string) => {
    await delay(600);
    return mockRides;
  },

  getDriverEarnings: async (id: string) => {
    await delay(600);
    return mockEarnings;
  },
  
  getDriverTimeline: async (id: string) => {
    await delay(600);
    return mockTimeline;
  },
  
  getDriverStatistics: async (id: string) => {
    await delay(500);
    return {
      totalTrips: 450,
      completedTrips: 420,
      cancelledTrips: 30,
      acceptanceRate: 92.5,
      completionRate: 93.3,
      totalEarnings: 325000,
      averageRating: 4.8,
    };
  }
};
