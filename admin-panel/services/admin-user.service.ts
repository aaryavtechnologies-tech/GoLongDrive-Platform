import apiClient from '@/lib/axios';
import { AdminUser, CreateAdminUserDTO, UpdateAdminUserDTO } from '@/types/admin-user';

export const getAllAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await apiClient.get('/admin/admin-users');
  return response.data.data;
};

export const createAdminUser = async (data: CreateAdminUserDTO): Promise<AdminUser> => {
  const response = await apiClient.post('/admin/admin-users', data);
  return response.data.data;
};

export const updateAdminUser = async (id: string, data: UpdateAdminUserDTO): Promise<AdminUser> => {
  const response = await apiClient.put(`/admin/admin-users/${id}`, data);
  return response.data.data;
};

export const deleteAdminUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/admin-users/${id}`);
};
