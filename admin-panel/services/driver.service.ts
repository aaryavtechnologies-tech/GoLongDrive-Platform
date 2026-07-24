import { 
  Driver, 
  DriverDocument, 
  DriverEarningSummary, 
  DriverRideSummary, 
  DriverTimelineEvent, 
  DriverApprovalStatus,
  DocumentStatus
} from '@/types/driver';

const mockDrivers: Driver[] = [
  {
    id: 'DRV-1001',
    avatar: 'https://i.pravatar.cc/150?u=drv1001',
    name: 'Rajesh Kumar',
    email: 'rajesh.k@example.com',
    phone: '+91 9876543210',
    gender: 'Male',
    dateOfBirth: '1985-05-15',
    address: '12, MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    emergencyContact: '+91 9988776655',
    experience: '5 Years',
    status: 'Approved',
    availability: 'Online',
    joinedDate: '2023-01-10T10:00:00Z',
    vehicle: {
      brand: 'Maruti Suzuki',
      model: 'Dzire',
      variant: 'VXI',
      vehicleNumber: 'MH 01 AB 1234',
      vehicleType: 'Sedan',
      fuelType: 'CNG',
      year: 2021,
      color: 'White',
      seatCapacity: 4,
      acAvailable: true,
      luggageCapacity: 'Medium',
      insuranceExpiry: '2024-10-15T00:00:00Z',
      pucExpiry: '2024-05-20T00:00:00Z',
    }
  },
  {
    id: 'DRV-1002',
    avatar: 'https://i.pravatar.cc/150?u=drv1002',
    name: 'Amit Sharma',
    email: 'amit.s@example.com',
    phone: '+91 8877665544',
    gender: 'Male',
    dateOfBirth: '1990-11-20',
    address: '45, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
    emergencyContact: '+91 7766554433',
    experience: '2 Years',
    status: 'Documents Submitted',
    availability: 'Offline',
    joinedDate: '2023-10-22T14:30:00Z',
    vehicle: {
      brand: 'Toyota',
      model: 'Innova Crysta',
      variant: 'GX',
      vehicleNumber: 'KA 05 CD 5678',
      vehicleType: 'SUV',
      fuelType: 'Diesel',
      year: 2022,
      color: 'Silver',
      seatCapacity: 7,
      acAvailable: true,
      luggageCapacity: 'Large',
      insuranceExpiry: '2024-12-01T00:00:00Z',
      pucExpiry: '2024-06-10T00:00:00Z',
    }
  },
  {
    id: 'DRV-1003',
    avatar: 'https://i.pravatar.cc/150?u=drv1003',
    name: 'Vikram Singh',
    email: 'vikram.s@example.com',
    phone: '+91 7766554433',
    gender: 'Male',
    dateOfBirth: '1988-02-19',
    address: '89, Connaught Place',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    emergencyContact: '+91 6655443322',
    experience: '7 Years',
    status: 'Suspended',
    availability: 'Offline',
    joinedDate: '2022-09-01T11:45:00Z',
    vehicle: {
      brand: 'Tata',
      model: 'Tiago',
      variant: 'XZ',
      vehicleNumber: 'DL 01 EF 9012',
      vehicleType: 'Hatchback',
      fuelType: 'Petrol',
      year: 2020,
      color: 'Red',
      seatCapacity: 4,
      acAvailable: true,
      luggageCapacity: 'Small',
      insuranceExpiry: '2023-08-15T00:00:00Z',
      pucExpiry: '2023-04-20T00:00:00Z',
    }
  },
];

const mockDocuments: DriverDocument[] = [
  { id: 'DOC-1', type: 'Profile Photo', url: 'https://picsum.photos/400/300?random=1', status: 'Approved', uploadedAt: '2023-01-10T10:05:00Z', reviewedBy: 'Admin', reviewedAt: '2023-01-10T11:00:00Z' },
  { id: 'DOC-2', type: 'Aadhaar Front', url: 'https://picsum.photos/400/300?random=2', status: 'Approved', uploadedAt: '2023-01-10T10:10:00Z', reviewedBy: 'Admin', reviewedAt: '2023-01-10T11:05:00Z' },
  { id: 'DOC-3', type: 'Driving License Front', url: 'https://picsum.photos/400/300?random=3', status: 'Pending', uploadedAt: '2023-01-10T10:15:00Z' },
  { id: 'DOC-4', type: 'RC Front', url: 'https://picsum.photos/400/300?random=4', status: 'Pending', uploadedAt: '2023-01-10T10:20:00Z' },
  { id: 'DOC-5', type: 'Vehicle Front', url: 'https://picsum.photos/400/300?random=5', status: 'Pending', uploadedAt: '2023-01-10T10:25:00Z' },
];

const mockRides: DriverRideSummary[] = [
  { id: 'RD-2001', pickup: 'Marine Drive', destination: 'Airport', customer: 'Alice Smith', tripType: 'Airport Drop', date: '2023-10-12T08:00:00Z', fare: 1500, status: 'Completed' },
  { id: 'RD-2002', pickup: 'Airport', destination: 'Marine Drive', customer: 'Bob Johnson', tripType: 'Airport Pickup', date: '2023-11-05T20:00:00Z', fare: 2200, status: 'Completed' },
];

const mockEarnings: DriverEarningSummary[] = [
  { id: 'ERN-3001', rideId: 'RD-2001', fare: 1500, commission: 300, driverEarning: 1200, paymentStatus: 'Paid', settlementStatus: 'Settled', date: '2023-10-12T08:00:00Z' },
  { id: 'ERN-3002', rideId: 'RD-2002', fare: 2200, commission: 440, driverEarning: 1760, paymentStatus: 'Paid', settlementStatus: 'Settled', date: '2023-11-05T20:00:00Z' },
];

const mockTimeline: DriverTimelineEvent[] = [
  { id: 'TL-1', type: 'registered', title: 'Driver Registered', description: 'Account created via Partner App', date: '2023-01-10T10:00:00Z' },
  { id: 'TL-2', type: 'doc_uploaded', title: 'Documents Uploaded', description: 'All mandatory documents submitted', date: '2023-01-10T10:30:00Z' },
  { id: 'TL-3', type: 'doc_approved', title: 'Documents Approved', description: 'Verification completed by Admin', date: '2023-01-10T11:00:00Z' },
  { id: 'TL-4', type: 'trip_completed', title: 'First Trip Completed', description: 'Ride RD-2001 completed', date: '2023-10-12T08:00:00Z' },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const driverService = {
  getDrivers: async (params?: any) => {
    await delay(800);
    let filtered = [...mockDrivers];
    
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(s) || 
        d.email.toLowerCase().includes(s) ||
        d.phone.includes(s) ||
        d.id.toLowerCase().includes(s) ||
        d.vehicle.vehicleNumber.toLowerCase().includes(s)
      );
    }
    
    if (params?.status && params.status !== 'All') {
      filtered = filtered.filter(d => d.status === params.status);
    }
    
    if (params?.availability && params.availability !== 'All') {
      filtered = filtered.filter(d => d.availability === params.availability);
    }

    if (params?.vehicleType && params.vehicleType !== 'All') {
      filtered = filtered.filter(d => d.vehicle.vehicleType === params.vehicleType);
    }
    
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

  getDriverById: async (id: string) => {
    await delay(500);
    const driver = mockDrivers.find(d => d.id === id);
    if (!driver) throw new Error('Driver not found');
    return driver;
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
