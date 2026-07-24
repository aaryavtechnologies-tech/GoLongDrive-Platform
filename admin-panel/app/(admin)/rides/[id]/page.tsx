'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRide, useRideTimeline } from '@/hooks/useRide';
import { BookingInformationCard } from '@/components/rides/BookingInformationCard';
import { CustomerDriverCards } from '@/components/rides/CustomerDriverCards';
import { LocationCards } from '@/components/rides/LocationCards';
import { FareBreakdownCard } from '@/components/rides/FareBreakdownCard';
import { RideTimeline } from '@/components/rides/RideTimeline';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Ban, Edit, Map } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AssignDriverDialog } from '@/components/rides/dialogs/AssignDriverDialog';
import { CancelRideDialog } from '@/components/rides/dialogs/CancelRideDialog';

export default function RideDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isAssignOpen, setIsAssignOpen] = React.useState(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);

  const { data: ride, isLoading: isRideLoading, isError: isRideError, refetch: refetchRide } = useRide(id);
  const { data: timeline, isLoading: isTimelineLoading } = useRideTimeline(id);

  if (isRideError) {
    return <ErrorBoundary error={new Error('Failed to load ride details')} reset={refetchRide} />;
  }

  const isPending = ride?.status === 'Pending' || ride?.status === 'Searching Driver';
  const canCancel = !ride?.status.includes('Completed') && !ride?.status.includes('Cancelled');

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-zinc-400 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-zinc-600" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/rides" className="text-zinc-400 hover:text-white">Rides</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-zinc-600" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-yellow-400">
                  {isRideLoading ? <Skeleton className="h-4 w-24 bg-zinc-800" /> : ride?.bookingNumber}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-3 mt-1">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 w-8 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white tracking-tight">Booking Details</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPending && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsAssignOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Driver
            </Button>
          )}
          {canCancel && (
            <Button 
              variant="outline" 
              className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
              onClick={() => setIsCancelOpen(true)}
            >
              <Ban className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          <Button variant="outline" className="border-white/10 text-white bg-transparent hover:bg-zinc-900">
            <Map className="mr-2 h-4 w-4" />
            Live Tracking
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isRideLoading ? (
            <Skeleton className="h-[200px] w-full bg-zinc-950 rounded-lg border border-white/5" />
          ) : ride ? (
            <BookingInformationCard ride={ride} />
          ) : null}

          {isRideLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[150px] w-full bg-zinc-950 rounded-lg border border-white/5" />
              <Skeleton className="h-[150px] w-full bg-zinc-950 rounded-lg border border-white/5" />
            </div>
          ) : ride ? (
            <CustomerDriverCards ride={ride} />
          ) : null}

          {isRideLoading ? (
            <Skeleton className="h-[150px] w-full bg-zinc-950 rounded-lg border border-white/5" />
          ) : ride ? (
            <LocationCards ride={ride} />
          ) : null}
        </div>

        <div className="lg:col-span-1 space-y-6">
          {isRideLoading ? (
            <Skeleton className="h-[300px] w-full bg-zinc-950 rounded-lg border border-white/5" />
          ) : ride ? (
            <FareBreakdownCard ride={ride} />
          ) : null}

          <RideTimeline data={timeline} isLoading={isTimelineLoading} />
        </div>
      </div>

      <AssignDriverDialog isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} rideId={id} />
      <CancelRideDialog isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} rideId={id} />
    </div>
  );
}
