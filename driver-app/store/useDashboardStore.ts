import { create } from "zustand";

export type DriverStatus = "offline" | "online" | "busy";

interface DashboardState {
  status: DriverStatus;
  setStatus: (status: DriverStatus) => void;
  // Stats
  todayTrips: number;
  todayEarnings: number;
  acceptanceRate: number;
  rating: number;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  status: "offline",
  setStatus: (status) => set({ status }),
  todayTrips: 4,
  todayEarnings: 2450.5,
  acceptanceRate: 92,
  rating: 4.8,
}));
