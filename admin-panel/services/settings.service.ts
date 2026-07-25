import apiClient from '@/lib/axios';
import { Settings, SystemStatus } from '@/types/settings';

export const getSettings = async (): Promise<Settings> => {
  const response = await apiClient.get('/admin/settings');
  return response.data.data.settings;
};

export const updateSettings = async (data: Partial<Settings>): Promise<Settings> => {
  const response = await apiClient.put('/admin/settings', data);
  return response.data.data.settings;
};

export const getSystemStatus = async (): Promise<SystemStatus> => {
  const response = await apiClient.get('/admin/settings/system/status');
  return response.data.data;
};
