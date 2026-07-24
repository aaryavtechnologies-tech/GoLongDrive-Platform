import apiClient from '@/lib/axios';
import { Customer, CustomerBookingSummary, CustomerPaymentSummary, CustomerStatus, CustomerTimelineEvent } from '@/types/customer';

// Mock Data
const mockCustomers: Customer[] = [
  {
    id: 'CUST-1001',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    name: 'Alice Smith',
    email: 'alice.smith@example.com',
    phone: '+91 9876543210',
    gender: 'Female',
    dateOfBirth: '1990-05-15',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '123, Marine Drive',
    joinedDate: '2023-01-10T10:00:00Z',
    status: 'Active',
    totalBookings: 24,
    completedTrips: 22,
    cancelledTrips: 2,
    totalSpending: 45000,
  },
  {
    id: 'CUST-1002',
    avatar: 'https://i.pravatar.cc/150?u=a04258a2462d826712d',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9988776655',
    gender: 'Male',
    dateOfBirth: '1985-11-20',
    city: 'Delhi',
    state: 'Delhi',
    address: '456, Connaught Place',
    joinedDate: '2023-03-22T14:30:00Z',
    status: 'Inactive',
    totalBookings: 5,
    completedTrips: 4,
    cancelledTrips: 1,
    totalSpending: 8500,
  },
  {
    id: 'CUST-1003',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    name: 'Sarah Connor',
    email: 'sarah.c@example.com',
    phone: '+91 8877665544',
    gender: 'Female',
    dateOfBirth: '1992-08-05',
    city: 'Bangalore',
    state: 'Karnataka',
    address: '789, MG Road',
    joinedDate: '2023-06-15T09:15:00Z',
    status: 'Active',
    totalBookings: 12,
    completedTrips: 12,
    cancelledTrips: 0,
    totalSpending: 32000,
  },
  {
    id: 'CUST-1004',
    avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d',
    name: 'Bruce Wayne',
    email: 'bruce.w@wayne.com',
    phone: '+91 7766554433',
    gender: 'Male',
    dateOfBirth: '1980-02-19',
    city: 'Pune',
    state: 'Maharashtra',
    address: '101, Koregaon Park',
    joinedDate: '2023-09-01T11:45:00Z',
    status: 'Blocked',
    totalBookings: 2,
    completedTrips: 1,
    cancelledTrips: 1,
    totalSpending: 5000,
  },
];

const mockBookings: CustomerBookingSummary[] = [
  { id: 'BK-2001', pickup: 'Marine Drive', destination: 'Airport', tripType: 'Airport Drop', date: '2023-10-12T08:00:00Z', driver: 'Mike Lee', vehicle: 'Sedan', fare: 1500, status: 'Completed' },
  { id: 'BK-2002', pickup: 'Airport', destination: 'Marine Drive', tripType: 'Airport Pickup', date: '2023-11-05T20:00:00Z', driver: 'Tom Hardy', vehicle: 'SUV', fare: 2200, status: 'Completed' },
  { id: 'BK-2003', pickup: 'Marine Drive', destination: 'Bandra', tripType: 'City Ride', date: '2023-12-01T18:30:00Z', driver: 'Bob Johnson', vehicle: 'Sedan', fare: 800, status: 'Completed' },
];

const mockPayments: CustomerPaymentSummary[] = [
  { id: 'PY-3001', bookingId: 'BK-2001', amount: 1500, method: 'Credit Card', status: 'Successful', date: '2023-10-12T08:05:00Z', receiptUrl: '#' },
  { id: 'PY-3002', bookingId: 'BK-2002', amount: 2200, method: 'UPI', status: 'Successful', date: '2023-11-05T20:10:00Z', receiptUrl: '#' },
  { id: 'PY-3003', bookingId: 'BK-2003', amount: 800, method: 'Cash', status: 'Successful', date: '2023-12-01T19:00:00Z', receiptUrl: '#' },
];

const mockTimeline: CustomerTimelineEvent[] = [
  { id: 'TL-1', type: 'registered', title: 'Customer Registered', description: 'Account created via Mobile App', date: '2023-01-10T10:00:00Z' },
  { id: 'TL-2', type: 'first_ride', title: 'First Ride Completed', description: 'Ride BK-2001 completed', date: '2023-10-12T08:00:00Z' },
  { id: 'TL-3', type: 'payment', title: 'Payment Successful', description: '₹1500 paid for BK-2001', date: '2023-10-12T08:05:00Z' },
  { id: 'TL-4', type: 'activity', title: 'Profile Updated', description: 'Changed profile picture', date: '2023-10-15T14:20:00Z' },
];

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const customerService = {
  getCustomers: async (params?: any) => {
    await delay(800);
    let filtered = [...mockCustomers];
    
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(s) || 
        c.email.toLowerCase().includes(s) ||
        c.phone.includes(s) ||
        c.id.toLowerCase().includes(s)
      );
    }
    
    if (params?.status && params.status !== 'All') {
      filtered = filtered.filter(c => c.status === params.status);
    }
    
    // Simple pagination mock
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    return {
      data: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    };
  },

  getCustomerById: async (id: string) => {
    await delay(500);
    const customer = mockCustomers.find(c => c.id === id);
    if (!customer) throw new Error('Customer not found');
    return customer;
  },

  updateCustomerStatus: async (id: string, status: CustomerStatus) => {
    await delay(600);
    // In a real app, API call here. We simulate success.
    return { success: true, id, status };
  },

  deleteCustomer: async (id: string) => {
    await delay(600);
    // In a real app, API call here
    return { success: true, id };
  },

  getCustomerBookings: async (id: string) => {
    await delay(600);
    return mockBookings; // Returning mock array for any ID for simplicity
  },

  getCustomerPayments: async (id: string) => {
    await delay(600);
    return mockPayments; // Returning mock array for any ID for simplicity
  },
  
  getCustomerTimeline: async (id: string) => {
    await delay(600);
    return mockTimeline;
  }
};
