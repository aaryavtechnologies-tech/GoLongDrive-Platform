import apiClient from '@/lib/axios';
import { Customer, CustomerBookingSummary, CustomerPaymentSummary, CustomerStatus, CustomerTimelineEvent } from '@/types/customer';

// Mock Data for sub-details (to be wired later)
const mockBookings: CustomerBookingSummary[] = [
  { id: 'BK-2001', pickup: 'Marine Drive', destination: 'Airport', tripType: 'Airport Drop', date: '2023-10-12T08:00:00Z', driver: 'Mike Lee', vehicle: 'Sedan', fare: 1500, status: 'Completed' },
  { id: 'BK-2002', pickup: 'Airport', destination: 'Marine Drive', tripType: 'Airport Pickup', date: '2023-11-05T20:00:00Z', driver: 'Tom Hardy', vehicle: 'SUV', fare: 2200, status: 'Completed' },
];

const mockPayments: CustomerPaymentSummary[] = [
  { id: 'PY-3001', bookingId: 'BK-2001', amount: 1500, method: 'Credit Card', status: 'Successful', date: '2023-10-12T08:05:00Z', receiptUrl: '#' },
];

const mockTimeline: CustomerTimelineEvent[] = [
  { id: 'TL-1', type: 'registered', title: 'Customer Registered', description: 'Account created', date: '2023-01-10T10:00:00Z' },
];

// Helper to simulate API delay for mocks
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const customerService = {
  getCustomers: async (params?: any) => {
    try {
      const queryParams: any = {};
      if (params?.status && params.status !== 'All') queryParams.status = params.status;
      if (params?.search) queryParams.search = params.search;
      if (params?.page) queryParams.page = params.page;
      if (params?.limit) queryParams.limit = params.limit;
      
      const response = await apiClient.get('/admin/customers', { params: queryParams });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      return { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
    }
  },

  getCustomerById: async (id: string) => {
    // Phase 1 fallback (ideally we should have a GET /admin/customers/:id)
    // For now, we will fetch the list and find the user to simulate it
    const response = await apiClient.get('/admin/customers', { params: { limit: 100 } });
    const customer = response.data.data.data.find((c: Customer) => c.id === id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  },

  updateCustomerStatus: async (id: string, status: CustomerStatus) => {
    await delay(600);
    // In a real app, API call here. We simulate success for now.
    return { success: true, id, status };
  },

  deleteCustomer: async (id: string) => {
    await delay(600);
    return { success: true, id };
  },

  getCustomerBookings: async (id: string) => {
    await delay(600);
    return mockBookings;
  },

  getCustomerPayments: async (id: string) => {
    await delay(600);
    return mockPayments;
  },
  
  getCustomerTimeline: async (id: string) => {
    await delay(600);
    return mockTimeline;
  }
};
