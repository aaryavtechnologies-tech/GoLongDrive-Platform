import { DashboardStats } from '@/types/dashboard';

export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    // Mock response for Phase 1
    return {
      totalCustomers: 1245,
      totalCustomersTrend: 12,
      totalDrivers: 320,
      totalDriversTrend: 5,
      activeDrivers: 145,
      todayBookings: 84,
      todayBookingsTrend: -2,
      todayRevenue: 45000,
      todayRevenueTrend: 8,
      pendingDocuments: 12,
      pendingPayments: 5,
      completedTrips: 452,
    };
  },
  
  getDashboardCharts: async () => {
    return {
      revenue: [
        { name: 'Jan', total: 12000 }, { name: 'Feb', total: 15000 },
        { name: 'Mar', total: 18000 }, { name: 'Apr', total: 16000 },
        { name: 'May', total: 22000 }, { name: 'Jun', total: 24000 },
        { name: 'Jul', total: 28000 }, { name: 'Aug', total: 25000 },
        { name: 'Sep', total: 29000 }, { name: 'Oct', total: 32000 },
        { name: 'Nov', total: 35000 }, { name: 'Dec', total: 40000 },
      ],
      bookings: [
        { name: 'Jan', count: 120 }, { name: 'Feb', count: 150 },
        { name: 'Mar', count: 180 }, { name: 'Apr', count: 160 },
        { name: 'May', count: 220 }, { name: 'Jun', count: 240 },
        { name: 'Jul', count: 280 }, { name: 'Aug', count: 250 },
        { name: 'Sep', count: 290 }, { name: 'Oct', count: 320 },
        { name: 'Nov', count: 350 }, { name: 'Dec', count: 400 },
      ],
      rideStatus: [
        { name: 'Completed', value: 400, color: '#22c55e' },
        { name: 'Running', value: 80, color: '#3b82f6' },
        { name: 'Pending', value: 50, color: '#eab308' },
        { name: 'Cancelled', value: 20, color: '#ef4444' },
      ],
      driverStatus: [
        { name: 'Available', value: 100, color: '#22c55e' },
        { name: 'Busy', value: 45, color: '#3b82f6' },
        { name: 'Offline', value: 175, color: '#94a3b8' },
      ],
    };
  },

  getRecentBookings: async () => {
    return [
      { id: 'BK-1001', customer: 'Alice Smith', driver: 'Bob Johnson', vehicle: 'SUV', trip: 'City A to City B', status: 'Running', fare: 2500 },
      { id: 'BK-1002', customer: 'John Doe', driver: 'Mike Lee', vehicle: 'Sedan', trip: 'Airport Drop', status: 'Pending', fare: 800 },
      { id: 'BK-1003', customer: 'Sarah Connor', driver: 'Tom Hardy', vehicle: 'Luxury', trip: 'City Tour', status: 'Completed', fare: 5000 },
      { id: 'BK-1004', customer: 'Bruce Wayne', driver: 'Alfred P.', vehicle: 'Sedan', trip: 'Hotel to Airport', status: 'Cancelled', fare: 900 },
    ];
  },
  
  getRecentDrivers: async () => {
    return [
      { id: 'DR-101', name: 'Bob Johnson', vehicle: 'SUV (XYZ-123)', status: 'Online', documents: 'Verified' },
      { id: 'DR-102', name: 'Mike Lee', vehicle: 'Sedan (ABC-456)', status: 'Online', documents: 'Pending' },
      { id: 'DR-103', name: 'Tom Hardy', vehicle: 'Luxury (LMN-789)', status: 'Busy', documents: 'Verified' },
    ];
  },
  
  getActivities: async () => {
    return [
      { id: '1', title: 'Booking Created', description: 'Alice Smith booked a ride', time: '10 mins ago', type: 'booking' },
      { id: '2', title: 'Payment Received', description: '₹5000 received for BK-1003', time: '25 mins ago', type: 'payment' },
      { id: '3', title: 'Driver Approved', description: 'Mike Lee\'s documents verified', time: '1 hour ago', type: 'driver' },
      { id: '4', title: 'Trip Completed', description: 'BK-1003 was completed', time: '2 hours ago', type: 'trip' },
    ];
  }
};
