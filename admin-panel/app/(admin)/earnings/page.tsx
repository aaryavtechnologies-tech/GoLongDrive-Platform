'use client';

import * as React from 'react';
import { useDriverEarnings } from '@/hooks/useFinance';
import { EarningFilters as FilterTypes } from '@/types/earning';
import { DriverEarningsTable } from '@/components/finance/DriverEarningsTable';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ListFilter, Landmark, FilterX } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function EarningsPage() {
  const [filters, setFilters] = React.useState<FilterTypes>({ 
    search: '', 
    status: 'All' 
  });
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const limit = 10;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError, refetch } = useDriverEarnings({ ...filters, page, limit });

  if (isError) {
    return <ErrorBoundary error={new Error('Failed to load earnings')} reset={refetch} />;
  }

  const earnings = data?.data || [];
  const hasActiveFilters = !!filters.search || filters.status !== 'All';

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Landmark className="h-6 w-6 text-yellow-400" />
            Driver Earnings
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage driver payouts, commissions, and settlements.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-zinc-950 p-4 rounded-lg border border-white/5 shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row flex-wrap gap-4 w-full">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search driver name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-400"
            />
          </div>
          
          <Select 
            value={filters.status || 'All'} 
            onValueChange={(v: any) => { setFilters({ ...filters, status: v }); setPage(1); }}
          >
            <SelectTrigger className="w-full sm:w-[160px] bg-zinc-900 border-zinc-800 text-white">
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-zinc-400" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Pending" className="text-yellow-500">Pending</SelectItem>
              <SelectItem value="Processing" className="text-blue-500">Processing</SelectItem>
              <SelectItem value="Completed" className="text-green-500">Completed</SelectItem>
              <SelectItem value="Failed" className="text-red-500">Failed</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchTerm('');
                setFilters({ search: '', status: 'All' });
                setPage(1);
              }}
              className="text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              <FilterX className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <DriverEarningsTable data={earnings} isLoading={isLoading} />
      
      {!isLoading && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-lg border border-white/5">
          <span className="text-sm text-zinc-400">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} records
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="border-white/10 text-white bg-transparent hover:bg-zinc-900"
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              disabled={page === data.totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="border-white/10 text-white bg-transparent hover:bg-zinc-900"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
