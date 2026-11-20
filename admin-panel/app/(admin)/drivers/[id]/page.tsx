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
import { 
  ArrowLeft, 
  Edit, 
  FileCheck2, 
  ShieldAlert, 
  XCircle, 
  RefreshCw, 
  Car, 
  Files, 
  History, 
  Wallet, 
  Clock, 
  UserCheck, 
  AlertTriangle 
} from 'lucide-react';
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

type TabType = 'overview' | 'rides' | 'earnings' | 'timeline';

export default function DriverDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = React.useState<TabType>('overview');

  const { data: driver, isLoading: isDriverLoading, isError: isDriverError, refetch: refetchDriver } = useDriver(id);
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useDriverStatistics(id);
  const { data: documents, isLoading: isDocsLoading, refetch: refetchDocs } = useDriverDocuments(id);
  const { data: rides, isLoading: isRidesLoading, refetch: refetchRides } = useDriverRides(id);
  const { data: earnings, isLoading: isEarningsLoading, refetch: refetchEarnings } = useDriverEarnings(id);
  const { data: timeline, isLoading: isTimelineLoading, refetch: refetchTimeline } = useDriverTimeline(id);
  
  const updateStatus = useUpdateDriverStatus();

  const handleRefreshAll = () => {
    refetchDriver();
    refetchStats();
    refetchDocs();
    refetchRides();
    refetchEarnings();
    refetchTimeline();
  };

  if (isDriverError) {
    return <ErrorBoundary error={new Error('Failed to load driver details')} reset={refetchDriver} />;
  }

  if (!isDriverLoading && !driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-20 w-20 bg-zinc-900/80 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
          <FileCheck2 className="h-10 w-10 text-zinc-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Driver Not Found</h2>
        <p className="text-zinc-400 text-center max-w-md text-sm">
          The driver ID <span className="font-mono text-yellow-400">{id}</span> does not exist or may have been removed.
        </p>
        <Button onClick={() => router.push('/drivers')} className="mt-4 bg-yellow-400 text-black hover:bg-yellow-300 font-semibold shadow-lg shadow-yellow-400/20">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Drivers List
        </Button>
      </div>
    );
  }

  const pendingDocsCount = documents?.filter((d: any) => d.status === 'Pending').length || 0;
  const allDocsApproved = documents?.length && documents.every((d: any) => d.status === 'Approved');

  const handleApproveDriver = () => {
    updateStatus.mutate({ id, status: 'Approved' });
  };

  return (
    <div className="space-y-6 pb-14 max-w-7xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-zinc-400 hover:text-white text-xs">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-zinc-600" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/drivers" className="text-zinc-400 hover:text-white text-xs">Drivers</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-zinc-600" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-yellow-400 font-medium text-xs">
                  {isDriverLoading ? <Skeleton className="h-3 w-20 bg-zinc-800" /> : (driver?.name || id)}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.back()} 
              className="text-zinc-400 hover:text-white hover:bg-zinc-900 border-white/10 h-9 w-9 rounded-xl shrink-0"
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {isDriverLoading ? <Skeleton className="h-7 w-40 bg-zinc-800" /> : (driver?.name || 'Driver Profile')}
                </h1>
                {driver?.status && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    driver.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                    driver.status === 'Rejected' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                    driver.status === 'Suspended' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                    'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {driver.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshAll}
            className="border-white/10 text-zinc-300 hover:text-white bg-zinc-950/50 hover:bg-zinc-900 h-9 rounded-xl"
            title="Refresh data"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>

          {driver?.status === 'Approved' ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 bg-transparent h-9 rounded-xl" 
              onClick={() => updateStatus.mutate({ id, status: 'Suspended' })}
              disabled={updateStatus.isPending}
            >
              Suspend Driver
            </Button>
          ) : driver?.status === 'Suspended' ? (
            <Button 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 rounded-xl shadow-lg shadow-emerald-500/20" 
              onClick={() => updateStatus.mutate({ id, status: 'Approved' })}
              disabled={updateStatus.isPending}
            >
              <UserCheck className="mr-1.5 h-4 w-4" />
              Reactivate Driver
            </Button>
          ) : null}
        </div>
      </div>

      {/* Driver Pending Verification Alert Banner */}
      {driver?.status !== 'Approved' && driver?.status !== 'Suspended' && !isDriverLoading && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-zinc-950 to-zinc-950 p-5 shadow-xl shadow-amber-500/5">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <ShieldAlert className="h-4 w-4" />
                <span>Driver Verification Pending</span>
                {pendingDocsCount > 0 && (
                  <span className="bg-amber-400/20 text-amber-200 text-xs px-2 py-0.5 rounded-full border border-amber-400/30">
                    {pendingDocsCount} {pendingDocsCount === 1 ? 'doc' : 'docs'} awaiting review
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                {allDocsApproved 
                  ? 'All verification documents have been inspected and approved. The driver is ready to be authorized for active duty on the platform.'
                  : 'Review the driver\'s identity, license, and vehicle registration documents before granting full platform driving access.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 md:flex-none border-rose-500/40 text-rose-400 bg-rose-500/5 hover:bg-rose-500/15 h-9 rounded-xl text-xs font-semibold"
                onClick={() => updateStatus.mutate({ id, status: 'Rejected' })}
                disabled={updateStatus.isPending}
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                Reject
              </Button>
              <Button 
                size="sm" 
                className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/25 border border-emerald-500/40 h-9 rounded-xl text-xs transition-all duration-300"
                onClick={handleApproveDriver}
                disabled={updateStatus.isPending}
              >
                <FileCheck2 className={`mr-1.5 h-3.5 w-3.5 ${updateStatus.isPending ? 'animate-pulse' : ''}`} />
                {updateStatus.isPending ? 'Approving...' : 'Approve Driver'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Overview Grid */}
      <DriverStatistics stats={stats} isLoading={isStatsLoading} />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Column: Driver Profile Card */}
        <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-6">
          {isDriverLoading ? (
            <Skeleton className="h-[480px] w-full bg-zinc-950/70 rounded-2xl border border-white/5" />
          ) : driver ? (
            <DriverProfile driver={driver} />
          ) : null}
        </div>

        {/* Right Column: Tabbed Content */}
        <div className="xl:col-span-2 space-y-5">
          {/* Modern Segmented Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-zinc-950/80 border border-white/10 rounded-2xl backdrop-blur-md overflow-x-auto shadow-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Files className="h-3.5 w-3.5" />
              <span>Vehicle & Documents</span>
              {pendingDocsCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'overview' ? 'bg-black/20 text-black' : 'bg-amber-400/20 text-amber-300'
                }`}>
                  {pendingDocsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('rides')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'rides'
                  ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Ride History</span>
              {rides && rides.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'rides' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {rides.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('earnings')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'earnings'
                  ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Earnings & Settlements</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Activity Log</span>
            </button>
          </div>

          {/* Tab 1: Vehicle & Documents */}
          {activeTab === 'overview' && (
            <div className="space-y-6 transition-all duration-300">
              {/* Vehicle Information */}
              {isDriverLoading ? (
                <Skeleton className="h-48 w-full bg-zinc-950/70 rounded-2xl border border-white/5" />
              ) : (
                <VehicleInformationCard vehicle={driver?.vehicle} />
              )}

              {/* Documents Verification Section */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">Verification Documents</h3>
                    {documents && (
                      <span className="text-xs text-zinc-500 font-mono">({documents.length})</span>
                    )}
                  </div>
                  {pendingDocsCount > 0 && (
                    <span className="text-xs text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 font-medium flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      {pendingDocsCount} Pending Review
                    </span>
                  )}
                </div>
                <DriverDocumentsGrid driverId={id} documents={documents} isLoading={isDocsLoading} />
              </div>
            </div>
          )}

          {/* Tab 2: Ride History */}
          {activeTab === 'rides' && (
            <div className="transition-all duration-300">
              <RideHistoryTable data={rides} isLoading={isRidesLoading} />
            </div>
          )}

          {/* Tab 3: Earnings & Settlements */}
          {activeTab === 'earnings' && (
            <div className="transition-all duration-300">
              <EarningsTable data={earnings} isLoading={isEarningsLoading} />
            </div>
          )}

          {/* Tab 4: Activity Timeline */}
          {activeTab === 'timeline' && (
            <div className="transition-all duration-300">
              <DriverTimeline data={timeline} isLoading={isTimelineLoading} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
