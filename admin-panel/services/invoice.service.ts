import { Invoice, InvoiceFilters } from '@/types/invoice';

const mockInvoices: Invoice[] = [
  {
    id: 'INV-9001',
    invoiceNumber: 'INV-2024-001',
    bookingNumber: 'BKG-59302',
    customerName: 'Alice Smith',
    driverName: 'Rajesh Kumar',
    amount: 1500,
    invoiceDate: '2024-05-15T09:15:00Z',
    status: 'Paid'
  },
  {
    id: 'INV-9002',
    invoiceNumber: 'INV-2024-002',
    bookingNumber: 'BKG-59303',
    customerName: 'Bob Johnson',
    amount: 1130,
    invoiceDate: '2024-06-18T14:20:00Z',
    status: 'Unpaid'
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const invoiceService = {
  getInvoices: async (params?: InvoiceFilters & { page?: number; limit?: number }) => {
    await delay(600);
    let filtered = [...mockInvoices];
    
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter((i: any) => 
        i.invoiceNumber.toLowerCase().includes(s) || 
        i.bookingNumber.toLowerCase().includes(s) ||
        i.customerName.toLowerCase().includes(s)
      );
    }
    
    if (params?.status && params.status !== 'All') {
      filtered = filtered.filter((i: any) => i.status === params.status);
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

  getInvoiceById: async (id: string) => {
    await delay(400);
    const inv = mockInvoices.find(i => i.id === id);
    if (!inv) throw new Error('Invoice not found');
    return inv;
  }
};
