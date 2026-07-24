import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '@/services/document.service';
import { DocumentStatus } from '@/types/document';
import { toast } from 'sonner';

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: DocumentStatus; notes?: string }) => 
      documentService.updateDocumentStatus(id, status, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', data.id] });
      queryClient.invalidateQueries({ queryKey: ['document-history', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-documents-count'] });
      toast.success(`Document marked as ${data.status}`);
    },
    onError: () => {
      toast.error('Failed to update document status');
    }
  });
}

export function useBulkUpdateDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status, notes }: { ids: string[]; status: DocumentStatus; notes?: string }) => 
      documentService.bulkUpdateDocumentStatus(ids, status, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['pending-documents-count'] });
      toast.success(`${data.ids.length} documents marked as ${data.status}`);
    },
    onError: () => {
      toast.error('Failed to perform bulk update');
    }
  });
}
