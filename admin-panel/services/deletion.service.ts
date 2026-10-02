import apiClient from '@/lib/axios';

export interface DeletionRequest {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'User' | 'Driver';
  reason: string;
  status: 'Pending' | 'Processed';
  createdAt: string;
}

export const deletionService = {
  getRequests: async (): Promise<DeletionRequest[]> => {
    const response = await apiClient.get('/admin/deletion-requests');
    return response.data.data.requests;
  },

  processRequest: async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/deletion-requests/${id}/process`);
  },
};
