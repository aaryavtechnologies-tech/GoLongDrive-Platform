'use client';

import * as React from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentFilters as FilterTypes } from '@/types/document';
import { DocumentsTable } from '@/components/documents/DocumentsTable';
import { DocumentFilters } from '@/components/documents/DocumentFilters';
import { BulkActionBar } from '@/components/documents/BulkActionBar';
import { ApproveDialog } from '@/components/documents/dialogs/ApproveDialog';
import { RejectDialog } from '@/components/documents/dialogs/RejectDialog';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { Button } from '@/components/ui/button';
import { Download, FileText, CheckCircle } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function DocumentsPage() {
  const [filters, setFilters] = React.useState<FilterTypes>({ 
    search: '', 
    status: 'Pending', // Default to pending for verification center
    type: 'All',
    city: 'All'
  });
  
  const [page, setPage] = React.useState(1);
  const limit = 10;
  
  // Row selection state for bulk actions
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  
  // Bulk Dialogs state
  const [isBulkApproveOpen, setIsBulkApproveOpen] = React.useState(false);
  const [isBulkRejectOpen, setIsBulkRejectOpen] = React.useState(false);

  const { data, isLoading, isError, refetch, isFetching } = useDocuments({
    ...filters,
    page,
    limit,
  });

  const handleFilterChange = (newFilters: FilterTypes) => {
    setFilters(newFilters);
    setPage(1);
    setRowSelection({}); // Clear selection on filter change
  };

  const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);

  if (isError) {
    return <ErrorBoundary error={new Error('Failed to load documents')} reset={refetch} />;
  }

  const documents = data?.data || [];

  return (
    <div className="space-y-6 relative pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-zinc-400 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-zinc-600" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-yellow-400">Verification Center</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-white tracking-tight">Document Verification</h1>
          <p className="text-sm text-zinc-400 mt-1">Review, approve, and manage driver documents globally.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 text-white bg-transparent hover:bg-zinc-900">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button 
            className="bg-zinc-800 text-white hover:bg-zinc-700 shadow-md border border-white/10"
            onClick={() => handleFilterChange({ ...filters, status: 'Pending' })}
          >
            <CheckCircle className="mr-2 h-4 w-4 text-yellow-400" />
            Review Pending
          </Button>
        </div>
      </div>

      <DocumentFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onRefresh={() => refetch()} 
        isFetching={isFetching} 
      />

      {documents.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-950/30 rounded-lg border border-white/5 border-dashed min-h-[400px]">
          <div className="bg-zinc-900/80 p-5 rounded-full mb-5 text-zinc-500 shadow-inner">
            <FileText className="h-10 w-10 text-yellow-400/70" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No documents found</h3>
          <p className="text-sm text-zinc-400 max-w-sm mb-6">
            We couldn't find any documents matching your current verification filters.
          </p>
          <Button onClick={() => handleFilterChange({ search: '', status: 'All', type: 'All', city: 'All' })} variant="outline" className="border-white/10 text-white hover:bg-zinc-900">
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          <DocumentsTable 
            data={documents} 
            isLoading={isLoading} 
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
          
          {!isLoading && data && data.totalPages > 1 && (
            <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-lg border border-white/5">
              <span className="text-sm text-zinc-400">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} documents
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

      {/* Floating Bulk Action Bar */}
      <BulkActionBar 
        selectedCount={selectedIds.length} 
        onClearSelection={() => setRowSelection({})}
        onApprove={() => setIsBulkApproveOpen(true)}
        onReject={() => setIsBulkRejectOpen(true)}
      />

      {/* Bulk Action Dialogs */}
      <ApproveDialog 
        isOpen={isBulkApproveOpen} 
        onClose={() => {
          setIsBulkApproveOpen(false);
          setRowSelection({});
        }} 
        documentIds={selectedIds}
        isBulk={true}
      />
      
      <RejectDialog 
        isOpen={isBulkRejectOpen} 
        onClose={() => {
          setIsBulkRejectOpen(false);
          setRowSelection({});
        }} 
        documentIds={selectedIds}
        isBulk={true}
      />
    </div>
  );
}
