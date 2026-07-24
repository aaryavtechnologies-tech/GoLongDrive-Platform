'use client';

import { Users, Car, CreditCard, Activity, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardStats } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface StatsGridProps {
  data?: DashboardStats;
  isLoading: boolean;
}

export function StatsGrid({ data, isLoading }: StatsGridProps) {
  const stats = [
    {
      title: 'Total Customers',
      value: data?.totalCustomers,
      icon: Users,
      trend: data?.totalCustomersTrend,
      trendLabel: 'from last month',
    },
    {
      title: 'Total Drivers',
      value: data?.totalDrivers,
      icon: Car,
      trend: data?.totalDriversTrend,
      trendLabel: 'from last month',
    },
    {
      title: "Today's Bookings",
      value: data?.todayBookings,
      icon: Activity,
      trend: data?.todayBookingsTrend,
      trendLabel: 'from yesterday',
    },
    {
      title: "Today's Revenue",
      value: data?.todayRevenue ? `₹${data.todayRevenue.toLocaleString()}` : undefined,
      icon: CreditCard,
      trend: data?.todayRevenueTrend,
      trendLabel: 'from yesterday',
    },
    {
      title: 'Pending Documents',
      value: data?.pendingDocuments,
      icon: FileText,
      trend: undefined,
      trendLabel: 'Needs review',
    },
    {
      title: 'Completed Trips',
      value: data?.completedTrips,
      icon: CheckCircle,
      trend: undefined,
      trendLabel: 'Overall',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-zinc-950 border-white/10 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-1/2 bg-zinc-800" />
              <Skeleton className="h-4 w-4 bg-zinc-800" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/3 mb-2 bg-zinc-800" />
              <Skeleton className="h-3 w-2/3 bg-zinc-800" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, i) => (
        <Card key={i} className="bg-zinc-950 border-white/5 text-white shadow-md relative overflow-hidden group hover:border-yellow-400/30 transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-yellow-400/0 group-hover:from-yellow-400/5 group-hover:to-transparent transition-colors duration-300 pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
              {stat.title}
            </CardTitle>
            <div className="p-2 bg-zinc-900 rounded-md group-hover:bg-yellow-400/10 group-hover:text-yellow-400 transition-colors">
              <stat.icon className="h-4 w-4 text-zinc-500 group-hover:text-yellow-400 transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold">{stat.value ?? '-'}</div>
            {stat.trend !== undefined && (
              <p className="text-xs mt-1 text-zinc-400">
                <span className={cn(
                  "font-medium", 
                  stat.trend > 0 ? "text-green-500" : stat.trend < 0 ? "text-red-500" : "text-zinc-500"
                )}>
                  {stat.trend > 0 ? '+' : ''}{stat.trend}%
                </span>{' '}
                {stat.trendLabel}
              </p>
            )}
            {stat.trend === undefined && stat.trendLabel && (
              <p className="text-xs mt-1 text-zinc-500">{stat.trendLabel}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
