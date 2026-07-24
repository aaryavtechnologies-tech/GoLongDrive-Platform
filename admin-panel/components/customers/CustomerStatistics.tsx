'use client';

import { Customer } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, CheckCircle, XCircle, CreditCard, Route } from 'lucide-react';

export function CustomerStatistics({ customer }: { customer: Customer }) {
  const stats = [
    {
      title: 'Total Bookings',
      value: customer.totalBookings,
      icon: Car,
      color: 'text-blue-500',
    },
    {
      title: 'Completed Trips',
      value: customer.completedTrips,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Cancelled Trips',
      value: customer.cancelledTrips,
      icon: XCircle,
      color: 'text-red-500',
    },
    {
      title: 'Total Spending',
      value: `₹${customer.totalSpending.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-yellow-500',
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
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
      ))}
    </div>
  );
}
