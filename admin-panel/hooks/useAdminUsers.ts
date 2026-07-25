import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '@/services/admin-user.service';
import { CreateAdminUserDTO, UpdateAdminUserDTO } from '@/types/admin-user';
import { toast } from 'sonner';

export const useAdminUsers = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['adminUsers'],
    queryFn: getAllAdminUsers,
  });

  const createMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('Admin user created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create admin user');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdminUserDTO }) => updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('Admin user updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update admin user');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('Admin user deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete admin user');
    }
  });

  return {
    adminUsers: query.data || [],
    isLoading: query.isLoading,
    createAdminUser: createMutation.mutateAsync,
    updateAdminUser: updateMutation.mutateAsync,
    deleteAdminUser: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
