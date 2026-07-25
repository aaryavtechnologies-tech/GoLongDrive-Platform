import apiClient from '@/lib/axios';
import { Role, Permission, CreateRoleDTO, UpdateRoleDTO } from '@/types/role';

export const getAllRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get('/admin/roles');
  return response.data.data.roles;
};

export const createRole = async (data: CreateRoleDTO): Promise<Role> => {
  const response = await apiClient.post('/admin/roles', data);
  return response.data.data.role;
};

export const updateRole = async (id: string, data: UpdateRoleDTO): Promise<Role> => {
  const response = await apiClient.put(`/admin/roles/${id}`, data);
  return response.data.data.role;
};

export const deleteRole = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/roles/${id}`);
};

export const getAllPermissions = async (): Promise<Permission[]> => {
  const response = await apiClient.get('/admin/roles/permissions');
  return response.data.data.permissions;
};
