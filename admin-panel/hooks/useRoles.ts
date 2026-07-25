import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllRoles, createRole, updateRole, deleteRole, getAllPermissions } from '@/services/role.service';
import { CreateRoleDTO, UpdateRoleDTO } from '@/types/role';
import { toast } from 'sonner';

export const useRoles = () => {
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: getAllRoles,
  });

  const permissionsQuery = useQuery({
    queryKey: ['permissions'],
    queryFn: getAllPermissions,
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create role');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDTO }) => updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update role');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete role');
    }
  });

  return {
    roles: rolesQuery.data || [],
    permissions: permissionsQuery.data || [],
    isLoadingRoles: rolesQuery.isLoading,
    isLoadingPermissions: permissionsQuery.isLoading,
    createRole: createMutation.mutateAsync,
    updateRole: updateMutation.mutateAsync,
    deleteRole: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
