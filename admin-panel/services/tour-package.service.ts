import apiClient from '@/lib/axios';

export interface TourPackage {
  _id: string;
  title: string;
  description: string;
  price: number;
  numberOfPersons: number;
  pricePerPerson: number;
  days: number;
  nights: number;
  route: string;
  placesToExplore: string[];
  includes: string[];
  excludes?: string[];
  imageUrl?: string;
  destinations?: Array<{ name: string; lat: number; lng: number }>;
  pricing?: Array<{ vehicleType: string; price: number }>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TourBooking {
  _id: string;
  bookingId: string;
  customer?: {
    _id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  driver?: {
    _id: string;
    fullName: string;
    phoneNumber: string;
    vehicleType?: string;
  };
  tourPackage?: TourPackage;
  pickupDate: string;
  pickupTime: string;
  pickupAddress: string;
  dropAddress: string;
  numberOfPassengers: number;
  estimatedFare: number;
  finalFare: number;
  rideStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  specialInstructions?: string;
  createdAt: string;
}

export const tourPackageService = {
  getPackages: async (): Promise<TourPackage[]> => {
    try {
      const response = await apiClient.get('/tour-packages', { params: { all: 'true' } });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch tour packages:', error);
      return [];
    }
  },

  getPackageById: async (id: string): Promise<TourPackage> => {
    const response = await apiClient.get(`/tour-packages/${id}`);
    return response.data.data;
  },

  createPackage: async (formData: FormData): Promise<TourPackage> => {
    const response = await apiClient.post('/tour-packages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  updatePackage: async (id: string, formData: FormData): Promise<TourPackage> => {
    const response = await apiClient.put(`/tour-packages/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  deletePackage: async (id: string): Promise<void> => {
    await apiClient.delete(`/tour-packages/${id}`);
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/tour-packages/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },

  getTourBookings: async (): Promise<TourBooking[]> => {
    try {
      const response = await apiClient.get('/admin/bookings', {
        params: { bookingType: 'tour_package' },
      });
      return response.data.data.bookings || [];
    } catch (error) {
      console.error('Failed to fetch tour bookings:', error);
      return [];
    }
  },

  confirmBooking: async (bookingId: string, notes?: string): Promise<any> => {
    const response = await apiClient.patch(`/admin/bookings/${bookingId}/confirm-tour`, { notes });
    return response.data;
  },

  assignDriver: async (bookingId: string, driverId: string): Promise<any> => {
    const response = await apiClient.patch(`/admin/bookings/${bookingId}/assign-driver`, { driverId });
    return response.data;
  },

  cancelBooking: async (bookingId: string, reason?: string): Promise<any> => {
    const response = await apiClient.patch(`/admin/bookings/${bookingId}/cancel`, {
      reason: reason || 'Cancelled by admin',
    });
    return response.data;
  },

  seedPackages: async (force: boolean = false): Promise<any> => {
    const response = await apiClient.post('/tour-packages/seed', { force });
    return response.data;
  },
};

