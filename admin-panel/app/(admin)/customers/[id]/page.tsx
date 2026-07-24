'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCustomer, useCustomerBookings, useCustomerPayments, useCustomerTimeline } from '@/hooks/useCustomer';
import { CustomerProfile } from '@/components/customers/CustomerProfile';
import { CustomerStatistics } from '@/components/customers/CustomerStatistics';
import { BookingHistoryTable } from '@/components/customers/BookingHistoryTable';
import { PaymentHistoryTable } from '@/components/customers/PaymentHistoryTable';
import { CustomerTimeline } from '@/components/customers/CustomerTimeline';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: customer, isLoading: isCustomerLoading, isError: isCustomerError, refetch: refetchCustomer } = useCustomer(id);
  const { data: bookings, isLoading: isBookingsLoading } = useCustomerBookings(id);
  const { data: payments, isLoading: isPaymentsLoading } = useCustomerPayments(id);
  const { data: timeline, isLoading: isTimelineLoading } = useCustomerTimeline(id);

  if (isCustomerError) {
    return <ErrorBoundary error={new Error('Failed to load customer details')} reset={refetchCustomer} />;
  }

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
                <BreadcrumbLink href="/customers" className="text-zinc-400 hover:text-white">Customers</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-zinc-600" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-yellow-400">
                  {isCustomerLoading ? <Skeleton className="h-4 w-24 bg-zinc-800" /> : customer?.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-3 mt-1">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400 hover:text-white hover:bg-zinc-900 h-8 w-8 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white tracking-tight">Customer Details</h1>
          </div>
        </div>
        <Button variant="outline" className="border-white/10 text-white bg-transparent hover:bg-zinc-900">
          <Edit className="mr-2 h-4 w-4" />
          Edit Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Profile & Timeline */}
        <div className="xl:col-span-1 space-y-6">
          {isCustomerLoading ? (
            <Skeleton className="h-[400px] w-full bg-zinc-950 rounded-lg border border-white/5" />
          ) : customer ? (
            <CustomerProfile customer={customer} />
          ) : null}

          <CustomerTimeline data={timeline} isLoading={isTimelineLoading} />
        </div>

        {/* Right Column - Stats, Bookings, Payments */}
        <div className="xl:col-span-2 space-y-6">
          {isCustomerLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[100px] w-full bg-zinc-950 rounded-lg border border-white/5" />
              ))}
            </div>
          ) : customer ? (
            <CustomerStatistics customer={customer} />
          ) : null}

          <BookingHistoryTable data={bookings} isLoading={isBookingsLoading} />
          
          <PaymentHistoryTable data={payments} isLoading={isPaymentsLoading} />
        </div>
      </div>
    </div>
  );
}
