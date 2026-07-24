export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue' | 'Cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingNumber: string;
  customerName: string;
  driverName?: string;
  amount: number;
  invoiceDate: string;
  status: InvoiceStatus;
}

export interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus | 'All';
}
