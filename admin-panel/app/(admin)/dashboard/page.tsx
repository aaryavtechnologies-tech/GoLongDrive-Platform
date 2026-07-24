'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { StatsGrid } from '@/components/dashboard/stats-grid';
import { RevenueChart } from '@/components/dashboard/charts/revenue-chart';
import { BookingsOverviewChart } from '@/components/dashboard/charts/bookings-overview-chart';
import { RideStatusChart } from '@/components/dashboard/charts/ride-status-chart';
import { DriverStatusChart } from '@/components/dashboard/charts/driver-status-chart';
import { RecentBookingsTable } from '@/components/dashboard/tables/recent-bookings-table';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { ErrorBoundary } from '@/components/common/error-boundary';

export default function DashboardPage() {
  const { 
    data: statsData, 
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: adminApi.getDashboardStats
  });

  const { 
    data: chartsData, 
    isLoading: chartsLoading,
  } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: adminApi.getDashboardCharts
  });

  const { 
    data: bookingsData, 
    isLoading: bookingsLoading,
  } = useQuery({
    queryKey: ['dashboard-recent-bookings'],
    queryFn: adminApi.getRecentBookings
  });

  const { 
    data: activitiesData, 
    isLoading: activitiesLoading,
  } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: adminApi.getActivities
  });

  if (statsError) {
    return <ErrorBoundary error={new Error('Failed to load dashboard')} reset={refetchStats} />;
  }

  return (
    <div className="space-y-6">
      <StatsGrid data={statsData} isLoading={statsLoading} />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <BookingsOverviewChart data={chartsData?.bookings} isLoading={chartsLoading} />
        </div>
        <div className="lg:col-span-3">
          <RevenueChart data={chartsData?.revenue} isLoading={chartsLoading} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBookingsTable data={bookingsData} isLoading={bookingsLoading} />
        </div>
        <div className="space-y-6">
          <div className="grid gap-6 grid-cols-2">
            <RideStatusChart data={chartsData?.rideStatus} isLoading={chartsLoading} />
            <DriverStatusChart data={chartsData?.driverStatus} isLoading={chartsLoading} />
          </div>
          <ActivityTimeline data={activitiesData} isLoading={activitiesLoading} />
        </div>
      </div>
    </div>
  );
}
