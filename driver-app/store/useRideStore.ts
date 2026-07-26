import { create } from "zustand";

export type RideStatus = "assigned" | "accepted" | "arrived" | "started" | "completed" | "cancelled";

interface Location {
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Ride {
  id: string;
  bookingNumber: string;
  tripType: string;
  status: RideStatus;
  pickupTime: string;
  customer: {
    name: string;
    phone: string;
    rating: number;
    avatar?: string;
  };
  pickup: Location;
  destination: Location;
  vehicle: {
    type: string;
    brand: string;
    model: string;
    number: string;
    color: string;
  };
  notes?: string;
}

interface RideState {
  currentRide: Ride | null;
  isLoading: boolean;
  setRideStatus: (status: RideStatus) => void;
  clearRide: () => void;
  // Mock data loader
  loadMockRide: () => void;
}

const MOCK_RIDE: Ride = {
  id: "ride_123",
  bookingNumber: "GLD-20260726-0012",
  tripType: "One Way",
  status: "assigned",
  pickupTime: "Today, 08:30 AM",
  customer: {
    name: "Arjun Kumar",
    phone: "+91 9876543210",
    rating: 4.8,
  },
  pickup: {
    address: "123, 100 Feet Road, Indiranagar",
    landmark: "Near Metro Station",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560038",
  },
  destination: {
    address: "Mysore Palace, Sayyaji Rao Road",
    landmark: "Agrahara",
    city: "Mysore",
    state: "Karnataka",
    pincode: "570001",
  },
  vehicle: {
    type: "SUV",
    brand: "Toyota",
    model: "Innova Crysta",
    number: "KA 01 AB 1234",
    color: "White",
  },
  notes: "Customer is carrying 2 large trolley bags. Please ensure boot space is empty.",
};

export const useRideStore = create<RideState>((set) => ({
  currentRide: null,
  isLoading: false,
  
  setRideStatus: (status) => set((state) => ({
    currentRide: state.currentRide ? { ...state.currentRide, status } : null
  })),

  clearRide: () => set({ currentRide: null }),

  loadMockRide: () => set({ currentRide: MOCK_RIDE, isLoading: false }),
}));
