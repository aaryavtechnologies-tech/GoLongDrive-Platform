import apiClient from '@/lib/axios';
import { Ride, RideStatus, RideTimelineEvent, RideFilters } from '@/types/ride';

const mockTimelines: Record<string, RideTimelineEvent[]> = {
  'RD-2001': [
    { id: 'TL-1', status: 'Pending', timestamp: '2024-05-12T10:30:00Z', user: 'Customer (Alice)' }
  ]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const rideService = {
  getRides: async (params?: any) => {
    try {
      // Map frontend params to backend expected params
      const queryParams: any = {};
      if (params?.status && params.status !== 'All') queryParams.status = params.status;
      if (params?.vehicleType && params.vehicleType !== 'All') queryParams.vehicleType = params.vehicleType;
      if (params?.date) queryParams.date = params.date;
      
      // the backend doesn't support search natively in getAllBookings, so we'll fetch all and filter in frontend if search is present
      const response = await apiClient.get('/admin/bookings', { params: queryParams });
      let bookings = response.data.data.bookings || [];
      
      // Search filter manually since backend doesn't support it directly in getAllBookings
      if (params?.search) {
        const s = params.search.toLowerCase();
        bookings = bookings.filter((r: any) => 
          (r.bookingId && r.bookingId.toLowerCase().includes(s)) || 
          (r.customer?.fullName && r.customer.fullName.toLowerCase().includes(s)) ||
          (r.driver?.fullName && r.driver.fullName.toLowerCase().includes(s))
        );
      }
      
      // Map to frontend shape
      const mapped = bookings.map((b: any) => ({
        id: b._id,
        bookingNumber: b.bookingId || b._id,
        customer: {
          id: b.customer?._id || 'N/A',
          name: b.customer?.fullName || 'Unknown',
          phone: b.customer?.phoneNumber || 'N/A',
          email: b.customer?.email || 'N/A',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(b.customer?.fullName || 'U')}&background=random`,
          rating: 5,
          totalBookings: 1
        },
        driver: b.driver ? {
          id: b.driver._id,
          name: b.driver.fullName,
          phone: b.driver.phoneNumber,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(b.driver.fullName)}&background=random`,
          vehicle: { brand: 'N/A', model: 'N/A', number: 'N/A', type: b.vehicleType },
          rating: 5,
          status: b.driver.driverStatus || 'Approved',
          availability: 'Busy'
        } : undefined,
        pickupLocation: {
          address: b.pickupLocation?.address || 'N/A',
          city: 'N/A', state: 'N/A', pincode: 'N/A'
        },
        dropLocation: {
          address: b.dropLocation?.address || 'N/A',
          city: 'N/A', state: 'N/A', pincode: 'N/A'
        },
        tripType: b.tripType || 'One Way',
        pickupDate: b.pickupDate ? new Date(b.pickupDate).toISOString().split('T')[0] : 'N/A',
        pickupTime: b.pickupTime || 'N/A',
        passengers: b.numberOfPassengers || 1,
        luggage: 'N/A',
        status: b.rideStatus || 'Pending',
        paymentStatus: 'Pending',
        fareBreakdown: {
          baseFare: b.estimatedFare || 0,
          distanceFare: 0,
          driverAllowance: 0,
          nightCharge: 0,
          parking: 0,
          toll: 0,
          extraCharges: 0,
          discount: 0,
          gst: 0,
          grandTotal: b.finalFare || b.estimatedFare || 0,
          advancePaid: 0,
          remainingAmount: b.finalFare || b.estimatedFare || 0
        },
        createdAt: b.createdAt
      }));
      
      // Frontend Pagination
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const start = (page - 1) * limit;
      const paginated = mapped.slice(start, start + limit);
      
      return {
        data: paginated,
        total: mapped.length,
        page,
        limit,
        totalPages: Math.ceil(mapped.length / limit)
      };
    } catch (error) {
      console.error('Failed to fetch rides:', error);
      return { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
    }
  },

  getRideById: async (id: string) => {
    const response = await apiClient.get(`/admin/bookings/${id}`);
    const b = response.data.data.booking;
    if (!b) throw new Error('Ride not found');
    
    return {
      id: b._id,
      bookingNumber: b.bookingId || b._id,
      customer: {
        id: b.customer?._id || 'N/A',
        name: b.customer?.fullName || 'Unknown',
        phone: b.customer?.phoneNumber || 'N/A',
        email: b.customer?.email || 'N/A',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(b.customer?.fullName || 'U')}&background=random`,
        rating: 5,
        totalBookings: 1
      },
      driver: b.driver ? {
        id: b.driver._id,
        name: b.driver.fullName,
        phone: b.driver.phoneNumber,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(b.driver.fullName)}&background=random`,
        vehicle: { brand: 'N/A', model: 'N/A', number: 'N/A', type: b.vehicleType },
        rating: 5,
        status: b.driver.driverStatus || 'Approved',
        availability: 'Busy'
      } : undefined,
      pickupLocation: {
        address: b.pickupLocation?.address || 'N/A',
        city: 'N/A', state: 'N/A', pincode: 'N/A'
      },
      dropLocation: {
        address: b.dropLocation?.address || 'N/A',
        city: 'N/A', state: 'N/A', pincode: 'N/A'
      },
      tripType: b.tripType || 'One Way',
      pickupDate: b.pickupDate ? new Date(b.pickupDate).toISOString().split('T')[0] : 'N/A',
      pickupTime: b.pickupTime || 'N/A',
      passengers: b.numberOfPassengers || 1,
      luggage: 'N/A',
      status: b.rideStatus || 'Pending',
      paymentStatus: 'Pending',
      fareBreakdown: {
        baseFare: b.estimatedFare || 0,
        distanceFare: 0,
        driverAllowance: 0,
        nightCharge: 0,
        parking: 0,
        toll: 0,
        extraCharges: 0,
        discount: 0,
        gst: 0,
        grandTotal: b.finalFare || b.estimatedFare || 0,
        advancePaid: 0,
        remainingAmount: b.finalFare || b.estimatedFare || 0
      },
      createdAt: b.createdAt
    };
  },

  updateRideStatus: async (id: string, status: RideStatus) => {
    // There isn't a direct "update status" endpoint that accepts arbitrary statuses.
    // The backend uses specific endpoints like /force-complete. 
    // We will simulate it via the general PUT for now, or just mock success.
    await delay(600);
    return { success: true, id, status };
  },

  assignDriver: async (rideId: string, driver: any) => {
    // Assuming driver object has an id.
    const response = await apiClient.patch(`/admin/bookings/${rideId}/assign-driver`, { driverId: driver.id });
    return { success: true, rideId };
  },

  cancelRide: async (rideId: string, reason?: string) => {
    const response = await apiClient.patch(`/admin/bookings/${rideId}/cancel`, { reason: reason || 'Cancelled by admin' });
    return { success: true, rideId };
  },

  getRideTimeline: async (id: string) => {
    // In a real app we'd fetch from backend timeline. For now return mock.
    await delay(400);
    return mockTimelines[id] || [];
  }
};
