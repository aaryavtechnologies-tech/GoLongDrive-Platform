'use client';

import { DriverRideSummary } from '@/types/driver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export function RideHistoryTable({ data, isLoading }: { data?: DriverRideSummary[], isLoading: boolean }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case 'Running': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Running</Badge>;
      case 'Pending': return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case 'Cancelled': return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-zinc-950 border-white/5 text-white shadow-md overflow-hidden hover:border-white/10 transition-colors duration-300">
      <CardHeader>
        <CardTitle className="text-lg">Ride History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-zinc-900" />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-white/10 overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-900/50">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Ride ID</TableHead>
                  <TableHead className="text-zinc-400">Customer</TableHead>
                  <TableHead className="text-zinc-400">Pickup</TableHead>
                  <TableHead className="text-zinc-400">Destination</TableHead>
                  <TableHead className="text-zinc-400">Date</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-right text-zinc-400">Fare</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((ride) => (
                    <TableRow key={ride.id} className="border-white/10 hover:bg-zinc-900/50">
                      <TableCell className="font-medium text-zinc-300">{ride.id}</TableCell>
                      <TableCell>{ride.customer}</TableCell>
                      <TableCell>{ride.pickup}</TableCell>
                      <TableCell>{ride.destination}</TableCell>
                      <TableCell className="text-zinc-400">{format(new Date(ride.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(ride.status)}</TableCell>
                      <TableCell className="text-right font-medium text-yellow-400">₹{ride.fare}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                      No rides found for this driver.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
