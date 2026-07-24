import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/services/document.service';
import { DocumentFilters } from '@/types/document';

export function useDocuments(params?: DocumentFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentService.getDocuments(params),
    placeholderData: (previousData) => previousData,
  });
}
