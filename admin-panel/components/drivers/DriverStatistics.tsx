'use client';

import { DriverStatistics as DriverStatsType } from '@/types/driver';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Route, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  Activity, 
  Target, 
  Navigation, 
  Star 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function DriverStatistics({ stats, isLoading }: { stats?: DriverStatsType, isLoading: boolean }) {
  const statItems = stats ? [
    {
      title: 'Total Rides',
      value: stats.totalTrips ?? 0,
      subtext: 'All time trips',
      icon: Navigation,
      gradient: 'from-blue-500/15 to-transparent',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      title: 'Completed',
      value: stats.completedTrips ?? 0,
      subtext: `${stats.totalTrips ? Math.round(((stats.completedTrips ?? 0) / stats.totalTrips) * 100) : 0}% success`,
      icon: CheckCircle2,
      gradient: 'from-emerald-500/15 to-transparent',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Rating',
      value: (stats.averageRating ?? 5.0).toFixed(1),
      subtext: 'Passenger score',
      icon: Star,
      gradient: 'from-yellow-500/15 to-transparent',
      iconBg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    {
      title: 'Total Earnings',
      value: `₹${(stats.totalEarnings ?? 0).toLocaleString('en-IN')}`,
      subtext: 'Net earnings',
      icon: IndianRupee,
      gradient: 'from-emerald-500/15 to-transparent',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Acceptance Rate',
      value: `${stats.acceptanceRate ?? 0}%`,
      subtext: 'Ride request accepted',
      icon: Target,
      gradient: 'from-purple-500/15 to-transparent',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate ?? 0}%`,
      subtext: 'Picked up to drop-off',
      icon: Activity,
      gradient: 'from-cyan-500/15 to-transparent',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      title: 'Cancelled Rides',
      value: stats.cancelledTrips ?? 0,
      subtext: 'Driver / rider cancellations',
      icon: XCircle,
      gradient: 'from-rose-500/15 to-transparent',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      title: 'Current Status',
      value: stats.currentRide ? 'On Trip' : 'Available',
      subtext: stats.currentRide ? `Ride #${stats.currentRide}` : 'No active ride',
      icon: Route,
      gradient: stats.currentRide ? 'from-yellow-500/15 to-transparent' : 'from-zinc-500/15 to-transparent',
      iconBg: stats.currentRide ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-zinc-800 text-zinc-400 border-white/5',
    }
  ] : [];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {isLoading ? (
        Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="bg-zinc-950/70 border border-white/5 shadow-md h-28 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16 bg-zinc-900" />
              <Skeleton className="h-6 w-6 rounded-md bg-zinc-900" />
            </div>
            <Skeleton className="h-6 w-20 bg-zinc-900" />
            <Skeleton className="h-2 w-24 bg-zinc-900" />
          </Card>
        ))
      ) : (
        statItems.map((stat, i) => (
          <Card 
            key={i} 
            className="bg-zinc-950/80 border border-white/5 hover:border-white/10 text-white shadow-lg rounded-xl overflow-hidden relative group transition-all duration-300 hover:translate-y-[-1px]"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-40 pointer-events-none`} />
            <CardContent className="p-4 relative flex flex-col justify-between h-full gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-zinc-400 truncate">
                  {stat.title}
                </span>
                <div className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                  <stat.icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-white truncate">
                  {stat.value}
                </div>
                <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                  {stat.subtext}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
