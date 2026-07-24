'use client';

import { DriverStatistics as DriverStatsType } from '@/types/driver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Route, CheckCircle, XCircle, CreditCard, Activity, Target, Navigation, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function DriverStatistics({ stats, isLoading }: { stats?: DriverStatsType, isLoading: boolean }) {
  const statItems = stats ? [
    {
      title: 'Total Trips',
      value: stats.totalTrips,
      icon: Navigation,
      color: 'text-blue-500',
    },
    {
      title: 'Completed Trips',
      value: stats.completedTrips,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Acceptance Rate',
      value: `${stats.acceptanceRate}%`,
      icon: Target,
      color: 'text-purple-500',
    },
    {
      title: 'Average Rating',
      value: stats.averageRating,
      icon: Star,
      color: 'text-yellow-400',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: Activity,
      color: 'text-cyan-500',
    },
    {
      title: 'Cancelled Trips',
      value: stats.cancelledTrips,
      icon: XCircle,
      color: 'text-red-500',
    },
    {
      title: 'Total Earnings',
      value: `₹${stats.totalEarnings.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-emerald-500',
    },
    {
      title: 'Current Ride',
      value: stats.currentRide || 'None',
      icon: Route,
      color: stats.currentRide ? 'text-yellow-500' : 'text-zinc-500',
    }
  ] : [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {isLoading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="bg-zinc-950 border-white/5 shadow-md h-[100px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-1/2 bg-zinc-900" />
              <Skeleton className="h-4 w-4 bg-zinc-900" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/3 bg-zinc-900" />
            </CardContent>
          </Card>
        ))
      ) : (
        statItems.map((stat, i) => (
          <Card key={i} className="bg-zinc-950 border-white/5 text-white shadow-md hover:border-white/10 transition-colors duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
