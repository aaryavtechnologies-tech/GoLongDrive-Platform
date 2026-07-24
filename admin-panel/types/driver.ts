export type DriverApprovalStatus = 'Pending' | 'Documents Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Suspended';
export type DriverAvailability = 'Online' | 'Offline' | 'Available' | 'Busy';
export type DocumentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Vehicle {
  brand: string;
  model: string;
  variant: string;
  vehicleNumber: string;
  vehicleType: string;
  fuelType: string;
  year: number;
  color: string;
  seatCapacity: number;
  acAvailable: boolean;
  luggageCapacity: string;
  insuranceExpiry: string;
  pucExpiry: string;
}

export interface Driver {
  id: string;
  avatar?: string;
  name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContact: string;
  experience: string;
  status: DriverApprovalStatus;
  availability: DriverAvailability;
  joinedDate: string;
  vehicle: Vehicle;
}

export interface DriverDocument {
  id: string;
  type: string; // e.g., 'Profile Photo', 'Driving License Front', etc.
  url: string;
  status: DocumentStatus;
  uploadedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface DriverRideSummary {
  id: string;
  pickup: string;
  destination: string;
  customer: string;
  tripType: string;
  fare: number;
  status: 'Completed' | 'Running' | 'Pending' | 'Cancelled';
  date: string;
}

export interface DriverEarningSummary {
  id: string;
  rideId: string;
  fare: number;
  commission: number;
  driverEarning: number;
  paymentStatus: 'Paid' | 'Pending';
  settlementStatus: 'Settled' | 'Unsettled';
  date: string;
}

export interface DriverStatistics {
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  currentRide?: string; // Ride ID if busy
  acceptanceRate: number; // percentage
  completionRate: number; // percentage
  totalEarnings: number;
  averageRating: number;
}

export interface DriverTimelineEvent {
  id: string;
  type: 'registered' | 'doc_uploaded' | 'doc_approved' | 'trip_completed' | 'suspended' | 'reactivated' | 'activity';
  title: string;
  description: string;
  date: string;
}

export interface DriverFilters {
  search?: string;
  status?: DriverApprovalStatus | 'All';
  availability?: DriverAvailability | 'All';
  vehicleType?: string | 'All';
  city?: string | 'All';
}
