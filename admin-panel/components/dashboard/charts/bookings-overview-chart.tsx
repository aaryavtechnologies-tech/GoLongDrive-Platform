'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BookingsChartProps {
  data?: { name: string; count: number }[];
  isLoading: boolean;
}

export function BookingsOverviewChart({ data, isLoading }: BookingsChartProps) {
  return (
    <Card className="bg-zinc-950 border-white/5 text-white col-span-1 shadow-md hover:border-white/10 transition-colors duration-300">
      <CardHeader>
        <CardTitle className="text-lg">Bookings Overview</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full bg-zinc-900" />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', color: '#fff' }}
                  formatter={(value: number) => [value, 'Bookings']}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#eab308" 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
