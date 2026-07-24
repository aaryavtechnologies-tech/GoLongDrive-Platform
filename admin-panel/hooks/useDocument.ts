import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/services/document.service';

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentService.getDocumentById(id),
    enabled: !!id,
  });
}

export function useDocumentHistory(id: string) {
  return useQuery({
    queryKey: ['document-history', id],
    queryFn: () => documentService.getDocumentHistory(id),
    enabled: !!id,
    refetchInterval: 5000, // Simulate real-time
  });
}

export function usePendingDocumentsCount() {
  return useQuery({
    queryKey: ['pending-documents-count'],
    queryFn: () => documentService.getPendingDocumentsCount(),
    refetchInterval: 10000, // Poll every 10s
  });
}
