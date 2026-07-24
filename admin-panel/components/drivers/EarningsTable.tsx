'use client';

import { DriverEarningSummary } from '@/types/driver';
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

export function EarningsTable({ data, isLoading }: { data?: DriverEarningSummary[], isLoading: boolean }) {
  const getSettlementBadge = (status: string) => {
    switch (status) {
      case 'Settled': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Settled</Badge>;
      case 'Unsettled': return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Unsettled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-zinc-950 border-white/5 text-white shadow-md overflow-hidden hover:border-white/10 transition-colors duration-300">
      <CardHeader>
        <CardTitle className="text-lg">Earnings History</CardTitle>
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
                  <TableHead className="text-zinc-400">Earning ID</TableHead>
                  <TableHead className="text-zinc-400">Ride ID</TableHead>
                  <TableHead className="text-zinc-400">Date</TableHead>
                  <TableHead className="text-right text-zinc-400">Total Fare</TableHead>
                  <TableHead className="text-right text-red-400">Commission</TableHead>
                  <TableHead className="text-right text-green-400">Driver Earned</TableHead>
                  <TableHead className="text-center text-zinc-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((earning) => (
                    <TableRow key={earning.id} className="border-white/10 hover:bg-zinc-900/50">
                      <TableCell className="font-medium text-zinc-300">{earning.id}</TableCell>
                      <TableCell>{earning.rideId}</TableCell>
                      <TableCell className="text-zinc-400">{format(new Date(earning.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right text-zinc-300">₹{earning.fare}</TableCell>
                      <TableCell className="text-right text-red-400">-₹{earning.commission}</TableCell>
                      <TableCell className="text-right font-bold text-green-400">₹{earning.driverEarning}</TableCell>
                      <TableCell className="text-center">{getSettlementBadge(earning.settlementStatus)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                      No earnings found.
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
