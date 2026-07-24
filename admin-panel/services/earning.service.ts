import { DriverEarning, EarningFilters, SettlementStatus } from '@/types/earning';

const mockEarnings: DriverEarning[] = [
  {
    id: 'ERN-1001',
    driverId: 'DRV-1001',
    driverName: 'Rajesh Kumar',
    completedTrips: 45,
    grossEarnings: 45000,
    commission: 4500, // 10%
    platformFee: 900, // 20 per trip
    netEarnings: 39600,
    settlementStatus: 'Completed',
    settlementDate: '2024-07-01T10:00:00Z'
  },
  {
    id: 'ERN-1002',
    driverId: 'DRV-1002',
    driverName: 'Amit Sharma',
    completedTrips: 12,
    grossEarnings: 15000,
    commission: 1500, // 10%
    platformFee: 240, // 20 per trip
    netEarnings: 13260,
    settlementStatus: 'Pending'
  },
  {
    id: 'ERN-1003',
    driverId: 'DRV-1003',
    driverName: 'Vikram Singh',
    completedTrips: 28,
    grossEarnings: 28000,
    commission: 2800, // 10%
    platformFee: 560, // 20 per trip
    netEarnings: 24640,
    settlementStatus: 'Processing'
  }
];

let mutableMockEarnings = [...mockEarnings];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const earningService = {
  getEarnings: async (params?: EarningFilters & { page?: number; limit?: number }) => {
    await delay(600);
    let filtered = [...mutableMockEarnings];
    
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.driverName.toLowerCase().includes(s) || 
        e.driverId.toLowerCase().includes(s)
      );
    }
    
    if (params?.status && params.status !== 'All') {
      filtered = filtered.filter(e => e.settlementStatus === params.status);
    }
    
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

  settleEarnings: async (id: string) => {
    await delay(800);
    const index = mutableMockEarnings.findIndex(e => e.id === id);
    if (index !== -1) {
      mutableMockEarnings[index].settlementStatus = 'Completed';
      mutableMockEarnings[index].settlementDate = new Date().toISOString();
    }
    return { success: true, id };
  }
};
