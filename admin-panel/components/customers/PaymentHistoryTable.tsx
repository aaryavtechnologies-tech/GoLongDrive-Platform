'use client';

import { CustomerPaymentSummary } from '@/types/customer';
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
import { FileText } from 'lucide-react';
import Link from 'next/link';

export function PaymentHistoryTable({ data, isLoading }: { data?: CustomerPaymentSummary[], isLoading: boolean }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Successful':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Successful</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>;
      case 'Failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-zinc-950 border-white/5 text-white shadow-md overflow-hidden hover:border-white/10 transition-colors duration-300">
      <CardHeader>
        <CardTitle className="text-lg">Payment History</CardTitle>
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
                  <TableHead className="text-zinc-400">Payment ID</TableHead>
                  <TableHead className="text-zinc-400">Booking ID</TableHead>
                  <TableHead className="text-zinc-400">Method</TableHead>
                  <TableHead className="text-zinc-400">Date</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-right text-zinc-400">Amount</TableHead>
                  <TableHead className="text-center text-zinc-400">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((payment) => (
                    <TableRow key={payment.id} className="border-white/10 hover:bg-zinc-900/50">
                      <TableCell className="font-medium text-zinc-300">{payment.id}</TableCell>
                      <TableCell>{payment.bookingId}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell className="text-zinc-400">{format(new Date(payment.date), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right font-medium text-yellow-400">₹{payment.amount}</TableCell>
                      <TableCell className="text-center">
                        <Link href={payment.receiptUrl || '#'} className="inline-flex items-center justify-center p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                          <FileText className="h-4 w-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                      No payments found for this customer.
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
