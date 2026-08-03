import apiClient from '@/lib/axios';
import { DriverDocumentDetails, DocumentStatus, VerificationHistoryEvent, DocumentFilters } from '@/types/document';

const mockTimelines: Record<string, VerificationHistoryEvent[]> = {
  'DOC-5001': [
    { id: 'TL-1', status: 'Submitted', timestamp: '2024-06-18T10:30:00Z', user: 'Driver (Amit)' },
    { id: 'TL-2', status: 'Pending', timestamp: '2024-06-18T10:30:05Z', user: 'System', remarks: 'Awaiting review' }
  ]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const documentService = {
  getDocuments: async (params?: any) => {
    try {
      const queryParams: any = {};
      if (params?.status && params.status !== 'All') queryParams.status = params.status;
      if (params?.type && params.type !== 'All') queryParams.type = params.type;
      if (params?.search) queryParams.search = params.search;
      if (params?.page) queryParams.page = params.page;
      if (params?.limit) queryParams.limit = params.limit;
      
      // city filter not directly supported by backend yet, will fetch and filter or just pass params
      const response = await apiClient.get('/admin/documents', { params: queryParams });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      return { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 10, totalPages: 0 };
    }
  },

  getDocumentById: async (id: string) => {
    // For now we don't have a single doc fetch in backend, fetch all and filter
    const response = await apiClient.get('/admin/documents', { params: { limit: 500 } });
    const docs = response.data.data.data || [];
    const doc = docs.find((d: any) => d.id === id);
    if (!doc) throw new Error('Document not found');
    return doc;
  },

  updateDocumentStatus: async (id: string, status: DocumentStatus, notes?: string) => {
    await delay(600);
    // Real implementation would call API
    return { success: true, id, status };
  },

  bulkUpdateDocumentStatus: async (ids: string[], status: DocumentStatus, notes?: string) => {
    await delay(1000);
    return { success: true, ids, status };
  },

  getDocumentHistory: async (id: string) => {
    await delay(400);
    return mockTimelines[id] || [];
  },
  
  getPendingDocumentsCount: async () => {
    // Fetch count roughly
    try {
      const response = await apiClient.get('/admin/documents', { params: { status: 'Pending', limit: 1 } });
      return response.data.data.total;
    } catch {
      return 0;
    }
  }
};
