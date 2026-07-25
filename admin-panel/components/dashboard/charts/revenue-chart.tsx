'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface RevenueChartProps {
  data?: { name: string; total: number }[];
  isLoading: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  return (
    <Card className="bg-zinc-950 border-white/5 text-white col-span-1 shadow-md hover:border-white/10 transition-colors duration-300">
      <CardHeader>
        <CardTitle className="text-lg">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        {isLoading ? (
          <Skeleton className="h-[300px] w-full bg-zinc-900" />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  cursor={{ fill: '#333' }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', color: '#fff' }}
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                />
                <Bar dataKey="total" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
