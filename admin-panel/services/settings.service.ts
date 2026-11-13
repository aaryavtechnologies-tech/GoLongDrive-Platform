import apiClient from '@/lib/axios';
import { Settings, SystemStatus } from '@/types/settings';

export const getSettings = async (): Promise<Settings> => {
  const response = await apiClient.get('/admin/settings');
  return response.data?.data?.settings;
};

export const updateSettings = async (data: Partial<Settings>): Promise<Settings> => {
  const response = await apiClient.put('/admin/settings', data);
  return response.data?.data?.settings;
};

export const getSystemStatus = async (): Promise<SystemStatus> => {
  const response = await apiClient.get('/admin/settings/system/status');
  return response.data?.data;
};

export const testSmtpEmail = async (data: any): Promise<any> => {
  const response = await apiClient.post('/admin/settings/email/test', data);
  return response.data;
};

export const getAdminProfile = async (): Promise<any> => {
  const response = await apiClient.get('/admin/profile');
  return response.data?.data?.admin;
};

export const updateAdminProfile = async (data: {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<any> => {
  const response = await apiClient.put('/admin/profile', data);
  return response.data?.data?.admin;
};
