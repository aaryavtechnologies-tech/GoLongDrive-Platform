import { Role } from './role';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  roleId?: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminUserDTO {
  name: string;
  email: string;
  password?: string;
  role: string;
  roleId?: string;
  isActive: boolean;
}

export interface UpdateAdminUserDTO extends Partial<CreateAdminUserDTO> {}
