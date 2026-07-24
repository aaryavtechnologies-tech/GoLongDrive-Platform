export type SettlementStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';

export interface DriverEarning {
  id: string;
  driverId: string;
  driverName: string;
  completedTrips: number;
  grossEarnings: number;
  commission: number; // GoLongDrive's cut (%)
  platformFee: number; // Flat fee
  netEarnings: number;
  settlementStatus: SettlementStatus;
  settlementDate?: string;
}

export interface EarningFilters {
  search?: string;
  status?: SettlementStatus | 'All';
}
