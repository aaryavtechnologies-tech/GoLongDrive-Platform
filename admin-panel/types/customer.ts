export type CustomerStatus = 'Active' | 'Inactive' | 'Blocked' | 'Deleted';

export interface Customer {
  id: string;
  avatar?: string;
  name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  city: string;
  state: string;
  address: string;
  joinedDate: string;
  status: CustomerStatus;
  totalBookings: number;
  completedTrips: number;
  cancelledTrips: number;
  totalSpending: number;
}

export interface CustomerBookingSummary {
  id: string;
  pickup: string;
  destination: string;
  tripType: string; // e.g., 'City to City', 'Airport Drop'
  date: string;
  driver: string;
  vehicle: string;
  fare: number;
  status: 'Completed' | 'Running' | 'Pending' | 'Cancelled';
}

export interface CustomerPaymentSummary {
  id: string;
  bookingId: string;
  amount: number;
  method: string; // e.g., 'Credit Card', 'UPI', 'Cash'
  status: 'Successful' | 'Pending' | 'Failed';
  date: string;
  receiptUrl?: string;
}

export interface CustomerTimelineEvent {
  id: string;
  type: 'registered' | 'first_ride' | 'payment' | 'cancelled_trip' | 'activity';
  title: string;
  description: string;
  date: string;
}

export interface CustomerStatistics {
  totalBookings: number;
  completedTrips: number;
  cancelledTrips: number;
  totalSpending: number;
  averageRideFare: number;
  averageTripDistance: string;
}

export interface CustomerFilters {
  search?: string;
  status?: CustomerStatus | 'All';
  dateRange?: {
    from: Date;
    to: Date;
  };
}
