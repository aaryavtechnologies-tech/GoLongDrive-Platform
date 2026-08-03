import { DashboardStats } from '@/types/dashboard';
import apiClient from './axios';

export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get('/admin/dashboard/overview');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return {
        totalRevenue: 0,
        totalBookings: 0,
        activeDrivers: 0,
        activeCustomers: 0,
        revenueChange: 0,
        bookingsChange: 0,
        driversChange: 0,
        customersChange: 0
      } as DashboardStats;
    }
  },
  
  getDashboardCharts: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/charts');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch dashboard charts:', error);
      return {
        revenue: [],
        bookings: [],
        rideStatus: [],
        driverStatus: []
      };
    }
  },

  getRecentBookings: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/recent-bookings');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch recent bookings:', error);
      return [];
    }
  },
  
  getRecentDrivers: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/recent-drivers');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch recent drivers:', error);
      return [];
    }
  },
  
  getActivities: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/activities');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return [];
    }
  }
};
