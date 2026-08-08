import { useMutation, useQueryClient } from '@tanstack/react-query';
import { driverService } from '@/services/driver.service';
import { DriverApprovalStatus, DocumentStatus } from '@/types/driver';
import { toast } from 'sonner';

export function useUpdateDriverStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DriverApprovalStatus }) => 
      driverService.updateDriverStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['driver', data.id] });
      queryClient.invalidateQueries({ queryKey: ['driver-documents', data.id] });
      toast.success(`Driver status updated to ${data.status}`);
    },
    onError: () => {
      toast.error('Failed to update driver status');
    }
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => driverService.deleteDriver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete driver');
    }
  });
}

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ driverId, docId, status, notes }: { driverId: string; docId: string; status: DocumentStatus; notes?: string }) => 
      driverService.updateDocumentStatus(driverId, docId, status, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['driver-documents', data.driverId] });
      toast.success(`Document marked as ${data.status}`);
    },
    onError: () => {
      toast.error('Failed to update document status');
    }
  });
}
