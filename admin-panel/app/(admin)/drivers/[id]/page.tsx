'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  useDriver, 
  useDriverDocuments, 
  useDriverRides, 
  useDriverEarnings, 
  useDriverTimeline,
  useDriverStatistics
} from '@/hooks/useDriver';
import { DriverProfile } from '@/components/drivers/DriverProfile';
import { VehicleInformationCard } from '@/components/drivers/VehicleInformationCard';
import { DriverStatistics } from '@/components/drivers/DriverStatistics';
import { DriverDocumentsGrid } from '@/components/drivers/DriverDocumentsGrid';
import { RideHistoryTable } from '@/components/drivers/RideHistoryTable';
import { EarningsTable } from '@/components/drivers/EarningsTable';
import { DriverTimeline } from '@/components/drivers/DriverTimeline';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, FileCheck2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useUpdateDriverStatus } from '@/hooks/useDriverActions';

export default function DriverDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: driver, isLoading: isDriverLoading, isError: isDriverError, refetch: refetchDriver } = useDriver(id);
  const { data: stats, isLoading: isStatsLoading } = useDriverStatistics(id);
  const { data: documents, isLoading: isDocsLoading } = useDriverDocuments(id);
  const { data: rides, isLoading: isRidesLoading } = useDriverRides(id);
  const { data: earnings, isLoading: isEarningsLoading } = useDriverEarnings(id);
  const { data: timeline, isLoading: isTimelineLoading } = useDriverTimeline(id);
  
  const updateStatus = useUpdateDriverStatus();

  if (isDriverError) {
    return <ErrorBoundary error={new Error('Failed to load driver details')} reset={refetchDriver} />;
  }

  const allDocsApproved = documents?.length && documents.every(d => d.status === 'Approved');

  const handleApproveDriver = () => {
    updateStatus.mutate({ id, status: 'Approved' });
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-zinc-400 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-zinc-600" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/drivers" className="text-zinc-400 hover:text-white">Drivers</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-zinc-600" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-yellow-400">
                  {isDriverLoading ? <Skeleton className="h-4 w-24 bg-zinc-800" /> : driver?.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-3 mt-1">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 w-8 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white tracking-tight">Driver Details</h1>
          </div>
        </div>
        <Button variant="outline" className="border-white/10 text-white bg-transparent hover:bg-zinc-900">
          <Edit className="mr-2 h-4 w-4" />
          Edit Driver
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile and Timeline Column */}
        <div className="xl:col-span-1 space-y-6">
          {isDriverLoading ? (
            <Skeleton className="h-[500px] w-full bg-zinc-950 rounded-lg border border-white/5" />
          ) : driver ? (
            <DriverProfile driver={driver} />
          ) : null}

          <DriverTimeline data={timeline} isLoading={isTimelineLoading} />
        </div>

        {/* Details, Documents, Stats, History Column */}
        <div className="xl:col-span-2 space-y-6">
          {isDriverLoading ? (
            <Skeleton className="h-[200px] w-full bg-zinc-950 rounded-lg border border-white/5" />
          ) : driver ? (
            <VehicleInformationCard vehicle={driver.vehicle} />
          ) : null}

          <DriverStatistics stats={stats} isLoading={isStatsLoading} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Document Verification</h2>
              {documents && documents.some(d => d.status === 'Pending') && (
                <span className="text-sm text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                  Pending Review
                </span>
              )}
            </div>
            <DriverDocumentsGrid driverId={id} documents={documents} isLoading={isDocsLoading} />
          </div>

          <RideHistoryTable data={rides} isLoading={isRidesLoading} />
          
          <EarningsTable data={earnings} isLoading={isEarningsLoading} />
        </div>
      </div>

      {/* Sticky Action Bar for Pending Approvals */}
      {driver?.status !== 'Approved' && !isDriverLoading && (
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-zinc-950/80 backdrop-blur-lg border-t border-white/10 flex items-center justify-between z-40 transform transition-transform shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div>
            <h4 className="font-medium text-white">Driver Approval Pending</h4>
            <p className="text-sm text-zinc-400">
              {allDocsApproved 
                ? 'All documents are approved. You can now approve the driver.'
                : 'Review and approve all documents before approving the driver.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-red-500/50 text-red-500 bg-transparent hover:bg-red-500/10 hover:text-red-400"
              onClick={() => updateStatus.mutate({ id, status: 'Rejected' })}
              disabled={updateStatus.isPending}
            >
              Reject Application
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
              onClick={handleApproveDriver}
              disabled={!allDocsApproved || updateStatus.isPending}
            >
              <FileCheck2 className="mr-2 h-4 w-4" />
              {updateStatus.isPending ? 'Approving...' : 'Approve Driver'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
