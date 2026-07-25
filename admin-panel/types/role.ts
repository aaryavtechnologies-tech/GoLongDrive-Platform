export interface Permission {
  _id: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDTO {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleDTO extends Partial<CreateRoleDTO> {}
