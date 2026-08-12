'use client';

import * as React from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { CustomerFilters as FilterTypes, CustomerStatus } from '@/types/customer';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { EmptyCustomers } from '@/components/customers/EmptyCustomers';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function CustomersPage() {
  const [filters, setFilters] = React.useState<FilterTypes>({ search: '', status: 'All' });
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const { data, isLoading, isError, refetch, isFetching } = useCustomers({
    ...filters,
    page,
    limit,
  });

  const handleFilterChange = (newFilters: FilterTypes) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: 'All' });
    setPage(1);
  };

  if (isError) {
    return <ErrorBoundary error={new Error('Failed to load customers')} reset={refetch} />;
  }

  const customers = data?.data || [];
  const hasActiveFilters = !!filters.search || (filters.status && filters.status !== 'All');

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
                <BreadcrumbPage className="text-yellow-400">Customers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customers Management</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage and view all customer profiles and activities.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-white bg-transparent hover:bg-zinc-900">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/customers/create">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg shadow-yellow-400/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        </div>
      </div>

      <CustomerFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onRefresh={() => refetch()} 
        isFetching={isFetching} 
      />

      {customers.length === 0 && !isLoading ? (
        <EmptyCustomers isSearch={hasActiveFilters} onClearFilters={handleClearFilters} />
      ) : (
        <>
          <CustomerTable data={customers} isLoading={isLoading} />
          
          {/* Simple Pagination Controls */}
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
