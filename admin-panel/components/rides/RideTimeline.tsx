'use client';

import { RideTimelineEvent } from '@/types/ride';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, CheckCircle, Navigation, Car, AlertCircle, Ban, Activity } from 'lucide-react';
import { format } from 'date-fns';

export function RideTimeline({ data, isLoading }: { data?: RideTimelineEvent[], isLoading: boolean }) {
  const getIcon = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'Searching Driver':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Driver Assigned':
      case 'Driver Accepted':
      case 'Confirmed':
      case 'Driver Arrived':
        return <Car className="h-4 w-4 text-blue-500" />;
      case 'Trip Started':
        return <Navigation className="h-4 w-4 text-purple-500" />;
      case 'Trip Completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'Cancelled by Customer':
      case 'Cancelled by Driver':
      case 'Cancelled by Admin':
        return <Ban className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <Card className="bg-zinc-950 border-white/5 text-white shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-zinc-400" />
          Ride Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-zinc-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded border border-white/5 bg-zinc-900/50">
                  <Skeleton className="h-4 w-1/2 mb-2 bg-zinc-800" />
                  <Skeleton className="h-3 w-3/4 bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-zinc-800">
            {data?.map((event) => (
              <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-zinc-950 bg-zinc-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow">
                  {getIcon(event.status)}
                </div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-lg border border-white/5 bg-zinc-900/50 shadow-sm hover:bg-zinc-900 hover:border-white/10 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                    <h4 className="font-medium text-sm text-zinc-200">{event.status}</h4>
                    <span className="text-xs text-zinc-500 whitespace-nowrap">
                      {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      By: {event.user}
                    </span>
                  </div>
                  {event.remarks && (
                    <p className="text-sm text-zinc-400 mt-2 p-2 bg-zinc-950/50 rounded italic border-l-2 border-zinc-700">
                      "{event.remarks}"
                    </p>
                  )}
                </div>
              </div>
            ))}
            {(!data || data.length === 0) && (
              <div className="text-center text-zinc-500 py-8">
                No timeline events found.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
