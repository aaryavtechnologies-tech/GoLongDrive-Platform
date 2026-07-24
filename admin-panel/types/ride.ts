export type RideStatus = 
  | 'Pending' 
  | 'Searching Driver' 
  | 'Driver Assigned' 
  | 'Driver Accepted' 
  | 'Confirmed' 
  | 'Driver Arrived' 
  | 'Trip Started' 
  | 'Trip Completed' 
  | 'Cancelled by Customer' 
  | 'Cancelled by Driver' 
  | 'Cancelled by Admin';

export type PaymentStatus = 'Pending' | 'Advance Paid' | 'Paid' | 'Refunded' | 'Failed';

export type TripType = 'One Way' | 'Round Trip' | 'Airport Pickup' | 'Airport Drop' | 'Multi-Day Rental' | 'Custom Tour Package';

export interface Location {
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CustomerMini {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  rating?: number;
  totalBookings?: number;
}

export interface DriverMini {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  vehicle: {
    brand: string;
    model: string;
    number: string;
    type: string;
  };
  rating?: number;
  status: string;
  availability: string;
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  driverAllowance: number;
  nightCharge: number;
  parking: number;
  toll: number;
  extraCharges: number;
  discount: number;
  couponCode?: string;
  gst: number;
  grandTotal: number;
  advancePaid: number;
  remainingAmount: number;
}

export interface RideTimelineEvent {
  id: string;
  status: RideStatus;
  timestamp: string;
  user: string; // e.g., 'Customer', 'Driver (Rajesh)', 'Admin (System)'
  remarks?: string;
}

export interface Ride {
  id: string;
  bookingNumber: string;
  customer: CustomerMini;
  driver?: DriverMini;
  pickupLocation: Location;
  dropLocation: Location;
  tripType: TripType;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  passengers: number;
  luggage: string;
  specialInstructions?: string;
  status: RideStatus;
  paymentStatus: PaymentStatus;
  fareBreakdown: FareBreakdown;
  createdAt: string;
}

export interface RideFilters {
  search?: string;
  status?: RideStatus | 'All';
  tripType?: TripType | 'All';
  paymentStatus?: PaymentStatus | 'All';
  vehicleType?: string | 'All';
  date?: string;
}
