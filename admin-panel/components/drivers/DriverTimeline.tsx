'use client';

import { DriverTimelineEvent } from '@/types/driver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, FileUp, FileCheck, Navigation, Ban, RefreshCcw, Activity } from 'lucide-react';
import { format } from 'date-fns';

export function DriverTimeline({ data, isLoading }: { data?: DriverTimelineEvent[], isLoading: boolean }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'registered': return <UserPlus className="h-4 w-4 text-purple-500" />;
      case 'doc_uploaded': return <FileUp className="h-4 w-4 text-blue-500" />;
      case 'doc_approved': return <FileCheck className="h-4 w-4 text-green-500" />;
      case 'trip_completed': return <Navigation className="h-4 w-4 text-emerald-500" />;
      case 'suspended': return <Ban className="h-4 w-4 text-red-500" />;
      case 'reactivated': return <RefreshCcw className="h-4 w-4 text-yellow-500" />;
      case 'activity':
      default: return <Activity className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <Card className="bg-zinc-950 border-white/5 text-white shadow-md hover:border-white/10 transition-colors duration-300">
      <CardHeader>
        <CardTitle className="text-lg">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-zinc-950 bg-zinc-800 text-zinc-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow" />
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded border border-white/10 bg-zinc-900 shadow">
                  <Skeleton className="h-4 w-1/2 mb-2 bg-zinc-800" />
                  <Skeleton className="h-3 w-3/4 bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
            {data?.map((event) => (
              <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-zinc-950 bg-zinc-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {getIcon(event.type)}
                </div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-lg border border-white/10 bg-zinc-900/50 shadow-sm hover:bg-zinc-900 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                    <h4 className="font-medium text-sm text-zinc-200">{event.title}</h4>
                    <span className="text-xs text-zinc-500 whitespace-nowrap">
                      {format(new Date(event.date), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">{event.description}</p>
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
