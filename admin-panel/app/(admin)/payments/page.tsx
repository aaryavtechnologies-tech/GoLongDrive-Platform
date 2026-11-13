'use client';

import * as React from 'react';
import { usePayments, useRevenueStats } from '@/hooks/useFinance';
import { PaymentFilters as FilterTypes, Payment } from '@/types/payment';
import { PaymentsTable } from '@/components/finance/PaymentsTable';
import { RevenueCards } from '@/components/finance/RevenueCards';
import { RevenueCharts } from '@/components/finance/RevenueCharts';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ListFilter, Download, CreditCard, FilterX, RefreshCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const [filters, setFilters] = React.useState<FilterTypes>({ 
    search: '', 
    status: 'All', 
    method: 'All' 
  });
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const limit = 10;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } = useRevenueStats();
  const { data, isLoading, isError, refetch: refetchPayments } = usePayments({ ...filters, page, limit });

  if (isError) {
    return <ErrorBoundary error={new Error('Failed to load payments ledger')} reset={refetchPayments} />;
  }

  const payments: Payment[] = data?.data || [];
  const hasActiveFilters = !!filters.search || filters.status !== 'All' || filters.method !== 'All';

  const handleExportCSV = () => {
    if (payments.length === 0) {
      toast.error('No payments to export.');
      return;
    }

    const headers = ['Payment ID', 'Booking ID', 'Customer', 'Driver', 'Total Amount', 'Advance Paid', 'Remaining Due', 'Method', 'Gateway', 'Status', 'Date'];
    const rows = payments.map(p => [
      `"${p.id}"`,
      `"${p.bookingNumber}"`,
      `"${p.customerName}"`,
      `"${p.driverName || 'N/A'}"`,
      p.amount,
      p.advancePaid,
      p.remainingDue,
      `"${p.paymentMethod}"`,
      `"${p.gateway}"`,
      `"${p.status}"`,
      `"${new Date(p.paymentDate).toISOString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `golongdrive-payments-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Payments report exported successfully');
  };

  const handleRefreshAll = () => {
    refetchStats();
    refetchPayments();
    toast.success('Finance metrics refreshed');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-yellow-400" />
            Finance & Revenue Dashboard
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time tracking of platform revenues, collected booking fares, and payment gateway activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshAll}
            className="border-white/10 text-zinc-300 bg-zinc-900 hover:text-white hover:bg-zinc-800 text-xs h-9"
          >
            <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-white/10 text-white bg-transparent hover:bg-zinc-900 text-xs h-9"
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            Export CSV Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <RevenueCards stats={statsData} isLoading={isStatsLoading} />

      {/* Charts & Diagrams */}
      <RevenueCharts />

      {/* Ledger Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-yellow-400" />
            Transactions & Payments Ledger
          </h2>
          {data && (
            <span className="text-xs text-zinc-400">
              Total {data.total} recorded transactions
            </span>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-zinc-950 p-4 rounded-xl border border-white/5 shadow-sm">
          <div className="flex flex-1 flex-col sm:flex-row flex-wrap gap-4 w-full">
            <div className="relative w-full sm:w-[320px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search payment ID, booking, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-400 text-sm"
              />
            </div>
            
            <Select 
              value={filters.status || 'All'} 
              onValueChange={(v: any) => { setFilters({ ...filters, status: v }); setPage(1); }}
            >
              <SelectTrigger className="w-full sm:w-[160px] bg-zinc-900 border-zinc-800 text-white text-sm">
                <div className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4 text-zinc-400" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Paid" className="text-green-400">Paid</SelectItem>
                <SelectItem value="Advance Paid" className="text-blue-400">Advance Paid</SelectItem>
                <SelectItem value="Pending" className="text-yellow-400">Pending</SelectItem>
                <SelectItem value="Refunded" className="text-zinc-400">Refunded</SelectItem>
                <SelectItem value="Failed" className="text-red-400">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.method || 'All'} 
              onValueChange={(v: any) => { setFilters({ ...filters, method: v }); setPage(1); }}
            >
              <SelectTrigger className="w-full sm:w-[160px] bg-zinc-900 border-zinc-800 text-white text-sm">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                <SelectItem value="All">All Methods</SelectItem>
                <SelectItem value="Online">Online (Razorpay / UPI)</SelectItem>
                <SelectItem value="Cash">Cash to Driver</SelectItem>
                <SelectItem value="Partial Advance">Partial Advance</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ search: '', status: 'All', method: 'All' });
                  setPage(1);
                }}
                className="text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Payments Table */}
        <PaymentsTable data={payments} isLoading={isLoading} />
        
        {/* Pagination */}
        {!isLoading && data && data.totalPages > 1 && (
          <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-white/5">
            <span className="text-xs text-zinc-400">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} payments
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="border-white/10 text-white bg-transparent hover:bg-zinc-900 text-xs h-8"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                disabled={page === data.totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="border-white/10 text-white bg-transparent hover:bg-zinc-900 text-xs h-8"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
