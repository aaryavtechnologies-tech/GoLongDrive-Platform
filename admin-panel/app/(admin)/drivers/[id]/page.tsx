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
import { ArrowLeft, Edit, FileCheck2, ShieldAlert, XCircle } from 'lucide-react';
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

  if (!isDriverLoading && !driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-24 w-24 bg-zinc-900 rounded-full flex items-center justify-center border border-white/10 mb-2">
          <FileCheck2 className="h-10 w-10 text-zinc-600" />
        </div>
        <h2 className="text-2xl font-bold text-white">Driver Not Found</h2>
        <p className="text-zinc-400 text-center max-w-md">
          The driver you are looking for does not exist or may have been deleted from the system.
        </p>
        <Button onClick={() => router.push('/drivers')} className="mt-4 bg-white text-black hover:bg-zinc-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Drivers
        </Button>
      </div>
    );
  }

  const allDocsApproved = documents?.length && documents.every((d: any) => d.status === 'Approved');

  const handleApproveDriver = () => {
    updateStatus.mutate({ id, status: 'Approved' });
  };

  return (
    <div className="space-y-6 pb-10">
      {driver?.status !== 'Approved' && !isDriverLoading && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />
          <div>
            <h4 className="font-semibold text-yellow-500 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Driver Approval Pending
            </h4>
            <p className="text-sm text-zinc-300 mt-1">
              {allDocsApproved 
                ? 'All uploaded documents are approved. You can now approve the driver to allow them on the platform.'
                : 'Warning: Not all documents are verified yet. You can still force-approve this driver for testing purposes.'}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button 
              variant="outline" 
              className="border-red-500/50 text-red-500 bg-transparent hover:bg-red-500/10 hover:text-red-400"
              onClick={() => updateStatus.mutate({ id, status: 'Rejected' })}
              disabled={updateStatus.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Driver
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(22,163,74,0.3)] hover:shadow-[0_0_25px_rgba(22,163,74,0.5)] transition-all duration-300 border border-green-500/50"
              onClick={handleApproveDriver}
              disabled={updateStatus.isPending}
            >
              <FileCheck2 className={`mr-2 h-4 w-4 ${updateStatus.isPending ? 'animate-pulse' : ''}`} />
              {updateStatus.isPending ? 'Approving...' : 'Approve Driver'}
            </Button>
          </div>
        </div>
      )}

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
            {driver?.status && (
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                driver.status === 'Approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                driver.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
              }`}>
                {driver.status}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {driver?.status === 'Approved' && (
             <Button variant="outline" className="border-orange-500/50 text-orange-500 bg-transparent hover:bg-orange-500/10" onClick={() => updateStatus.mutate({ id, status: 'Suspended' })}>
               Suspend Driver
             </Button>
          )}
          <Button variant="outline" className="border-white/10 text-white bg-transparent hover:bg-zinc-900">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
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
              {documents && documents.some((d: any) => d.status === 'Pending') && (
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
    </div>
  );
}
