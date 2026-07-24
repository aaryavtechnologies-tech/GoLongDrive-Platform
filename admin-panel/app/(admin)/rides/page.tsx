'use client';

import * as React from 'react';
import { useRides } from '@/hooks/useRides';
import { RideFilters as FilterTypes } from '@/types/ride';
import { RideTable } from '@/components/rides/RideTable';
import { RideFilters } from '@/components/rides/RideFilters';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { Button } from '@/components/ui/button';
import { Download, Plus, Navigation } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function RidesPage() {
  const [filters, setFilters] = React.useState<FilterTypes>({ 
    search: '', 
    status: 'All',
    tripType: 'All',
    paymentStatus: 'All',
    date: ''
  });
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const { data, isLoading, isError, refetch, isFetching } = useRides({
    ...filters,
    page,
    limit,
  });

  const handleFilterChange = (newFilters: FilterTypes) => {
    setFilters(newFilters);
    setPage(1);
  };

  if (isError) {
    return <ErrorBoundary error={new Error('Failed to load rides')} reset={refetch} />;
  }

  const rides = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-zinc-400 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-zinc-600" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-yellow-400">Rides</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-white tracking-tight">Ride Management</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage bookings, assign drivers, and track trip status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-white bg-transparent hover:bg-zinc-900">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg shadow-yellow-400/20">
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      <RideFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onRefresh={() => refetch()} 
        isFetching={isFetching} 
      />

      {rides.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-950/30 rounded-lg border border-white/5 border-dashed min-h-[400px]">
          <div className="bg-zinc-900/80 p-5 rounded-full mb-5 text-zinc-500 shadow-inner">
            <Navigation className="h-10 w-10 text-yellow-400/70" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No rides found</h3>
          <p className="text-sm text-zinc-400 max-w-sm mb-6">
            We couldn't find any rides matching your criteria.
          </p>
          <Button onClick={() => handleFilterChange({ search: '', status: 'All', tripType: 'All', paymentStatus: 'All', date: '' })} variant="outline" className="border-white/10 text-white hover:bg-zinc-900">
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          <RideTable data={rides} isLoading={isLoading} />
          
          {!isLoading && data && data.totalPages > 1 && (
            <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-lg border border-white/5">
              <span className="text-sm text-zinc-400">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} entries
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
        </>
      )}
    </div>
  );
}
