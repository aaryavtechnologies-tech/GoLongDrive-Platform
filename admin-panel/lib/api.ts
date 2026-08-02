import { DashboardStats } from '@/types/dashboard';
import apiClient from './axios';

export const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/admin/dashboard/overview');
    return response.data.data; // response.helper returns { success, message, data }
  },
  
  getDashboardCharts: async () => {
    const response = await apiClient.get('/admin/dashboard/charts');
    return response.data.data;
  },

  getRecentBookings: async () => {
    const response = await apiClient.get('/admin/dashboard/recent-bookings');
    return response.data.data;
  },
  
  getRecentDrivers: async () => {
    const response = await apiClient.get('/admin/dashboard/recent-drivers');
    return response.data.data;
  },
  
  getActivities: async () => {
    const response = await apiClient.get('/admin/dashboard/activities');
    return response.data.data;
  }
};
