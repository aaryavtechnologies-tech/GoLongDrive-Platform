export type DocumentStatus = 'Pending' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Expired';

export interface DocumentMetadata {
  size: number; // in bytes
  fileType: string;
  lastUpdated: string;
}

export interface VerificationHistoryEvent {
  id: string;
  status: DocumentStatus;
  timestamp: string;
  user: string; // 'System', 'Admin (Name)', 'Driver (Name)'
  remarks?: string;
}

export interface DriverDocumentDetails {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverEmail: string;
  driverAvatar?: string;
  driverApprovalStatus: string;
  vehicleNumber: string;
  vehicleType: string;
  city: string;
  type: string; // 'Aadhaar Front', 'Driving License', etc.
  url: string;
  status: DocumentStatus;
  uploadedAt: string;
  expiryDate?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  metadata: DocumentMetadata;
}

export interface DocumentFilters {
  search?: string;
  status?: DocumentStatus | 'All';
  type?: string | 'All';
  city?: string | 'All';
}
