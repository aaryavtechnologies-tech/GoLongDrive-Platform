import { fetchWithAuth } from './settings.service';

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
    const response = await fetchWithAuth('/admin/deletion-requests');
    if (!response.ok) {
      throw new Error('Failed to fetch deletion requests');
    }
    const data = await response.json();
    return data.data.requests;
  },

  processRequest: async (id: string): Promise<void> => {
    const response = await fetchWithAuth(`/admin/deletion-requests/${id}/process`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Failed to process deletion request');
    }
  },
};
