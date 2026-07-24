import { Ride, RideStatus, RideTimelineEvent, RideFilters } from '@/types/ride';

const mockRides: Ride[] = [
  {
    id: 'RD-2001',
    bookingNumber: 'BKG-59302',
    customer: {
      id: 'CUST-001',
      name: 'Alice Smith',
      phone: '+91 9876543211',
      email: 'alice@example.com',
      avatar: 'https://i.pravatar.cc/150?u=alice',
      rating: 4.8,
      totalBookings: 12
    },
    driver: {
      id: 'DRV-1001',
      name: 'Rajesh Kumar',
      phone: '+91 9876543210',
      avatar: 'https://i.pravatar.cc/150?u=drv1001',
      vehicle: {
        brand: 'Maruti Suzuki',
        model: 'Dzire',
        number: 'MH 01 AB 1234',
        type: 'Sedan'
      },
      rating: 4.9,
      status: 'Approved',
      availability: 'Busy'
    },
    pickupLocation: {
      address: '12, Marine Drive',
      landmark: 'Near Oberoi Hotel',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400020'
    },
    dropLocation: {
      address: 'Chhatrapati Shivaji Maharaj International Airport',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400099'
    },
    tripType: 'Airport Drop',
    pickupDate: '2024-05-15',
    pickupTime: '08:00',
    passengers: 2,
    luggage: 'Medium',
    status: 'Trip Completed',
    paymentStatus: 'Paid',
    fareBreakdown: {
      baseFare: 800,
      distanceFare: 400,
      driverAllowance: 0,
      nightCharge: 0,
      parking: 100,
      toll: 80,
      extraCharges: 0,
      discount: 0,
      gst: 120,
      grandTotal: 1500,
      advancePaid: 500,
      remainingAmount: 0
    },
    createdAt: '2024-05-12T10:30:00Z'
  },
  {
    id: 'RD-2002',
    bookingNumber: 'BKG-59303',
    customer: {
      id: 'CUST-002',
      name: 'Bob Johnson',
      phone: '+91 9876543222',
      email: 'bob@example.com',
      avatar: 'https://i.pravatar.cc/150?u=bob',
      rating: 4.5,
      totalBookings: 5
    },
    pickupLocation: {
      address: 'Koramangala 4th Block',
      landmark: 'Sony World Signal',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034'
    },
    dropLocation: {
      address: 'Electronic City Phase 1',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560100'
    },
    tripType: 'One Way',
    pickupDate: '2024-06-20',
    pickupTime: '18:30',
    passengers: 3,
    luggage: 'None',
    status: 'Searching Driver',
    paymentStatus: 'Advance Paid',
    fareBreakdown: {
      baseFare: 500,
      distanceFare: 600,
      driverAllowance: 0,
      nightCharge: 0,
      parking: 0,
      toll: 0,
      extraCharges: 0,
      discount: 50,
      couponCode: 'WELCOME50',
      gst: 80,
      grandTotal: 1130,
      advancePaid: 300,
      remainingAmount: 830
    },
    createdAt: '2024-06-18T14:15:00Z'
  },
  {
    id: 'RD-2003',
    bookingNumber: 'BKG-59304',
    customer: {
      id: 'CUST-003',
      name: 'Charlie Davis',
      phone: '+91 9876543333',
      email: 'charlie@example.com',
      avatar: 'https://i.pravatar.cc/150?u=charlie',
      rating: 4.9,
      totalBookings: 22
    },
    driver: {
      id: 'DRV-1002',
      name: 'Amit Sharma',
      phone: '+91 8877665544',
      avatar: 'https://i.pravatar.cc/150?u=drv1002',
      vehicle: {
        brand: 'Toyota',
        model: 'Innova Crysta',
        number: 'KA 05 CD 5678',
        type: 'SUV'
      },
      rating: 4.6,
      status: 'Approved',
      availability: 'Busy'
    },
    pickupLocation: {
      address: 'Indiranagar 100ft Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560038'
    },
    dropLocation: {
      address: 'Mysore Palace',
      city: 'Mysore',
      state: 'Karnataka',
      pincode: '570001'
    },
    tripType: 'Round Trip',
    pickupDate: '2024-06-25',
    pickupTime: '06:00',
    returnDate: '2024-06-26',
    returnTime: '20:00',
    passengers: 5,
    luggage: 'Large',
    specialInstructions: 'Need a carrier on top for extra luggage',
    status: 'Trip Started',
    paymentStatus: 'Advance Paid',
    fareBreakdown: {
      baseFare: 2000,
      distanceFare: 4500,
      driverAllowance: 1000,
      nightCharge: 0,
      parking: 200,
      toll: 450,
      extraCharges: 0,
      discount: 0,
      gst: 550,
      grandTotal: 8700,
      advancePaid: 2000,
      remainingAmount: 6700
    },
    createdAt: '2024-06-20T09:00:00Z'
  }
];

let mutableMockRides = [...mockRides];

const mockTimelines: Record<string, RideTimelineEvent[]> = {
  'RD-2001': [
    { id: 'TL-1', status: 'Pending', timestamp: '2024-05-12T10:30:00Z', user: 'Customer (Alice)' },
    { id: 'TL-2', status: 'Searching Driver', timestamp: '2024-05-12T10:35:00Z', user: 'System' },
    { id: 'TL-3', status: 'Driver Assigned', timestamp: '2024-05-12T10:45:00Z', user: 'System', remarks: 'Rajesh Kumar assigned' },
    { id: 'TL-4', status: 'Confirmed', timestamp: '2024-05-12T10:50:00Z', user: 'Driver (Rajesh)', remarks: 'Ride accepted' },
    { id: 'TL-5', status: 'Driver Arrived', timestamp: '2024-05-15T07:50:00Z', user: 'Driver (Rajesh)' },
    { id: 'TL-6', status: 'Trip Started', timestamp: '2024-05-15T08:05:00Z', user: 'Driver (Rajesh)' },
    { id: 'TL-7', status: 'Trip Completed', timestamp: '2024-05-15T09:10:00Z', user: 'Driver (Rajesh)', remarks: 'Payment collected' }
  ],
  'RD-2002': [
    { id: 'TL-1', status: 'Pending', timestamp: '2024-06-18T14:15:00Z', user: 'Customer (Bob)' },
    { id: 'TL-2', status: 'Searching Driver', timestamp: '2024-06-18T14:20:00Z', user: 'System' }
  ],
  'RD-2003': [
    { id: 'TL-1', status: 'Pending', timestamp: '2024-06-20T09:00:00Z', user: 'Customer (Charlie)' },
    { id: 'TL-2', status: 'Searching Driver', timestamp: '2024-06-20T09:05:00Z', user: 'System' },
    { id: 'TL-3', status: 'Driver Assigned', timestamp: '2024-06-20T09:30:00Z', user: 'Admin (System)', remarks: 'Amit Sharma assigned manually' },
    { id: 'TL-4', status: 'Confirmed', timestamp: '2024-06-20T09:45:00Z', user: 'Driver (Amit)' },
    { id: 'TL-5', status: 'Trip Started', timestamp: '2024-06-25T06:15:00Z', user: 'Driver (Amit)' }
  ]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const rideService = {
  getRides: async (params?: any) => {
    await delay(800);
    let filtered = [...mutableMockRides];
    
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.id.toLowerCase().includes(s) || 
        r.bookingNumber.toLowerCase().includes(s) ||
        r.customer.name.toLowerCase().includes(s) ||
        r.driver?.name.toLowerCase().includes(s) ||
        r.pickupLocation.city.toLowerCase().includes(s) ||
        r.dropLocation.city.toLowerCase().includes(s)
      );
    }
    
    if (params?.status && params.status !== 'All') {
      filtered = filtered.filter(r => r.status === params.status);
    }
    
    if (params?.paymentStatus && params.paymentStatus !== 'All') {
      filtered = filtered.filter(r => r.paymentStatus === params.paymentStatus);
    }

    if (params?.tripType && params.tripType !== 'All') {
      filtered = filtered.filter(r => r.tripType === params.tripType);
    }

    if (params?.date) {
      filtered = filtered.filter(r => r.pickupDate === params.date);
    }
    
    // sorting
    filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

  getRideById: async (id: string) => {
    await delay(500);
    const ride = mutableMockRides.find(r => r.id === id);
    if (!ride) throw new Error('Ride not found');
    return ride;
  },

  updateRideStatus: async (id: string, status: RideStatus) => {
    await delay(600);
    const rideIndex = mutableMockRides.findIndex(r => r.id === id);
    if (rideIndex !== -1) {
      mutableMockRides[rideIndex].status = status;
      
      if (!mockTimelines[id]) mockTimelines[id] = [];
      mockTimelines[id].push({
        id: `TL-${Date.now()}`,
        status,
        timestamp: new Date().toISOString(),
        user: 'Admin (System)',
        remarks: 'Status updated by Admin'
      });
    }
    return { success: true, id, status };
  },

  assignDriver: async (rideId: string, driver: any) => {
    await delay(800);
    const rideIndex = mutableMockRides.findIndex(r => r.id === rideId);
    if (rideIndex !== -1) {
      mutableMockRides[rideIndex].driver = driver;
      mutableMockRides[rideIndex].status = 'Driver Assigned';
      
      if (!mockTimelines[rideId]) mockTimelines[rideId] = [];
      mockTimelines[rideId].push({
        id: `TL-${Date.now()}`,
        status: 'Driver Assigned',
        timestamp: new Date().toISOString(),
        user: 'Admin (System)',
        remarks: `${driver.name} assigned manually`
      });
    }
    return { success: true, rideId };
  },

  cancelRide: async (rideId: string, reason?: string) => {
    await delay(600);
    const rideIndex = mutableMockRides.findIndex(r => r.id === rideId);
    if (rideIndex !== -1) {
      mutableMockRides[rideIndex].status = 'Cancelled by Admin';
      if (!mockTimelines[rideId]) mockTimelines[rideId] = [];
      mockTimelines[rideId].push({
        id: `TL-${Date.now()}`,
        status: 'Cancelled by Admin',
        timestamp: new Date().toISOString(),
        user: 'Admin (System)',
        remarks: reason || 'Cancelled by Admin'
      });
    }
    return { success: true, rideId };
  },

  getRideTimeline: async (id: string) => {
    await delay(400);
    return mockTimelines[id] || [];
  }
};
