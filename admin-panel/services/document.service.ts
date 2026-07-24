import { DriverDocumentDetails, DocumentStatus, VerificationHistoryEvent, DocumentFilters } from '@/types/document';

const mockDocuments: DriverDocumentDetails[] = [
  {
    id: 'DOC-5001',
    driverId: 'DRV-1002',
    driverName: 'Amit Sharma',
    driverPhone: '+91 8877665544',
    driverEmail: 'amit.s@example.com',
    driverAvatar: 'https://i.pravatar.cc/150?u=drv1002',
    driverApprovalStatus: 'Documents Submitted',
    vehicleNumber: 'KA 05 CD 5678',
    vehicleType: 'SUV',
    city: 'Bangalore',
    type: 'Driving License Front',
    url: 'https://picsum.photos/800/500?random=11',
    status: 'Pending',
    uploadedAt: '2024-06-18T10:30:00Z',
    expiryDate: '2029-05-20T00:00:00Z',
    metadata: {
      size: 1024 * 1024 * 2.5, // 2.5 MB
      fileType: 'image/jpeg',
      lastUpdated: '2024-06-18T10:30:00Z'
    }
  },
  {
    id: 'DOC-5002',
    driverId: 'DRV-1002',
    driverName: 'Amit Sharma',
    driverPhone: '+91 8877665544',
    driverEmail: 'amit.s@example.com',
    driverAvatar: 'https://i.pravatar.cc/150?u=drv1002',
    driverApprovalStatus: 'Documents Submitted',
    vehicleNumber: 'KA 05 CD 5678',
    vehicleType: 'SUV',
    city: 'Bangalore',
    type: 'Aadhaar Front',
    url: 'https://picsum.photos/800/500?random=12',
    status: 'Pending',
    uploadedAt: '2024-06-18T10:35:00Z',
    metadata: {
      size: 1024 * 1024 * 1.8,
      fileType: 'image/jpeg',
      lastUpdated: '2024-06-18T10:35:00Z'
    }
  },
  {
    id: 'DOC-5003',
    driverId: 'DRV-1001',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 9876543210',
    driverEmail: 'rajesh.k@example.com',
    driverAvatar: 'https://i.pravatar.cc/150?u=drv1001',
    driverApprovalStatus: 'Approved',
    vehicleNumber: 'MH 01 AB 1234',
    vehicleType: 'Sedan',
    city: 'Mumbai',
    type: 'Insurance Certificate',
    url: 'https://picsum.photos/800/1000?random=13',
    status: 'Approved',
    uploadedAt: '2023-01-10T10:15:00Z',
    expiryDate: '2024-10-15T00:00:00Z',
    reviewedBy: 'Admin (System)',
    reviewedAt: '2023-01-11T09:00:00Z',
    metadata: {
      size: 1024 * 1024 * 3.1,
      fileType: 'application/pdf', // Mocked as pdf but pic url
      lastUpdated: '2023-01-10T10:15:00Z'
    }
  },
  {
    id: 'DOC-5004',
    driverId: 'DRV-1003',
    driverName: 'Vikram Singh',
    driverPhone: '+91 7766554433',
    driverEmail: 'vikram.s@example.com',
    driverAvatar: 'https://i.pravatar.cc/150?u=drv1003',
    driverApprovalStatus: 'Suspended',
    vehicleNumber: 'DL 01 EF 9012',
    vehicleType: 'Hatchback',
    city: 'Delhi',
    type: 'PUC Certificate',
    url: 'https://picsum.photos/800/1000?random=14',
    status: 'Expired',
    uploadedAt: '2022-09-01T11:45:00Z',
    expiryDate: '2023-04-20T00:00:00Z',
    reviewedBy: 'Admin (System)',
    reviewedAt: '2022-09-02T10:00:00Z',
    notes: 'Driver must upload new PUC to lift suspension.',
    metadata: {
      size: 1024 * 500, // 500 KB
      fileType: 'image/png',
      lastUpdated: '2022-09-01T11:45:00Z'
    }
  },
  {
    id: 'DOC-5005',
    driverId: 'DRV-1002',
    driverName: 'Amit Sharma',
    driverPhone: '+91 8877665544',
    driverEmail: 'amit.s@example.com',
    driverAvatar: 'https://i.pravatar.cc/150?u=drv1002',
    driverApprovalStatus: 'Documents Submitted',
    vehicleNumber: 'KA 05 CD 5678',
    vehicleType: 'SUV',
    city: 'Bangalore',
    type: 'RC Front',
    url: 'https://picsum.photos/800/500?random=15',
    status: 'Rejected',
    uploadedAt: '2024-06-18T10:40:00Z',
    reviewedBy: 'Admin (System)',
    reviewedAt: '2024-06-19T08:00:00Z',
    notes: 'Image is too blurry. Please re-upload a clear picture of the RC.',
    metadata: {
      size: 1024 * 1024 * 1.2,
      fileType: 'image/jpeg',
      lastUpdated: '2024-06-18T10:40:00Z'
    }
  }
];

let mutableMockDocuments = [...mockDocuments];

const mockTimelines: Record<string, VerificationHistoryEvent[]> = {
  'DOC-5001': [
    { id: 'TL-1', status: 'Submitted', timestamp: '2024-06-18T10:30:00Z', user: 'Driver (Amit)' },
    { id: 'TL-2', status: 'Pending', timestamp: '2024-06-18T10:30:05Z', user: 'System', remarks: 'Awaiting review' }
  ],
  'DOC-5003': [
    { id: 'TL-1', status: 'Submitted', timestamp: '2023-01-10T10:15:00Z', user: 'Driver (Rajesh)' },
    { id: 'TL-2', status: 'Under Review', timestamp: '2023-01-11T08:55:00Z', user: 'Admin (System)' },
    { id: 'TL-3', status: 'Approved', timestamp: '2023-01-11T09:00:00Z', user: 'Admin (System)', remarks: 'Verified against portal' }
  ],
  'DOC-5005': [
    { id: 'TL-1', status: 'Submitted', timestamp: '2024-06-18T10:40:00Z', user: 'Driver (Amit)' },
    { id: 'TL-2', status: 'Rejected', timestamp: '2024-06-19T08:00:00Z', user: 'Admin (System)', remarks: 'Image is too blurry. Please re-upload a clear picture of the RC.' }
  ]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const documentService = {
  getDocuments: async (params?: any) => {
    await delay(700);
    let filtered = [...mutableMockDocuments];
    
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(d => 
        d.id.toLowerCase().includes(s) || 
        d.driverName.toLowerCase().includes(s) ||
        d.driverId.toLowerCase().includes(s) ||
        d.vehicleNumber.toLowerCase().includes(s) ||
        d.type.toLowerCase().includes(s)
      );
    }
    
    if (params?.status && params.status !== 'All') {
      filtered = filtered.filter(d => d.status === params.status);
    }
    
    if (params?.type && params.type !== 'All') {
      filtered = filtered.filter(d => d.type === params.type);
    }

    if (params?.city && params.city !== 'All') {
      filtered = filtered.filter(d => d.city === params.city);
    }
    
    // sorting by upload date newest first
    filtered = filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    return {
      data: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit)
    };
  },

  getDocumentById: async (id: string) => {
    await delay(500);
    const doc = mutableMockDocuments.find(d => d.id === id);
    if (!doc) throw new Error('Document not found');
    return doc;
  },

  updateDocumentStatus: async (id: string, status: DocumentStatus, notes?: string) => {
    await delay(600);
    const docIndex = mutableMockDocuments.findIndex(d => d.id === id);
    if (docIndex !== -1) {
      mutableMockDocuments[docIndex].status = status;
      if (notes) mutableMockDocuments[docIndex].notes = notes;
      mutableMockDocuments[docIndex].reviewedBy = 'Admin (You)';
      mutableMockDocuments[docIndex].reviewedAt = new Date().toISOString();
      
      if (!mockTimelines[id]) mockTimelines[id] = [];
      mockTimelines[id].push({
        id: `TL-${Date.now()}`,
        status,
        timestamp: new Date().toISOString(),
        user: 'Admin (You)',
        remarks: notes || `Document marked as ${status}`
      });
    }
    return { success: true, id, status };
  },

  bulkUpdateDocumentStatus: async (ids: string[], status: DocumentStatus, notes?: string) => {
    await delay(1000);
    ids.forEach(id => {
      const docIndex = mutableMockDocuments.findIndex(d => d.id === id);
      if (docIndex !== -1) {
        mutableMockDocuments[docIndex].status = status;
        if (notes) mutableMockDocuments[docIndex].notes = notes;
        mutableMockDocuments[docIndex].reviewedBy = 'Admin (You)';
        mutableMockDocuments[docIndex].reviewedAt = new Date().toISOString();
        
        if (!mockTimelines[id]) mockTimelines[id] = [];
        mockTimelines[id].push({
          id: `TL-${Date.now()}`,
          status,
          timestamp: new Date().toISOString(),
          user: 'Admin (You)',
          remarks: notes || `Bulk marked as ${status}`
        });
      }
    });
    return { success: true, ids, status };
  },

  getDocumentHistory: async (id: string) => {
    await delay(400);
    return mockTimelines[id] || [];
  },
  
  getPendingDocumentsCount: async () => {
    await delay(300);
    return mutableMockDocuments.filter(d => d.status === 'Pending' || d.status === 'Under Review').length;
  }
};
