'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Payment } from '@/types/payment';
import { PaymentStatusBadge } from './FinanceStatusBadges';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Receipt,
  MoreHorizontal,
  CornerDownLeft,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRefundPayment } from '@/hooks/useFinanceActions';
import { toast } from 'sonner';

interface PaymentsTableProps {
  data: Payment[];
  isLoading: boolean;
}

export function PaymentsTable({ data, isLoading }: PaymentsTableProps) {
  const refundMutation = useRefundPayment();
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null);

  const handleRefund = (id: string, amount: number) => {
    if (confirm(`Are you sure you want to issue a refund of ₹${amount.toLocaleString()} for this payment?`)) {
      refundMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return { date: 'N/A', time: '' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: 'N/A', time: '' };
      return {
        date: format(d, 'dd MMM yyyy'),
        time: format(d, 'HH:mm'),
      };
    } catch {
      return { date: 'N/A', time: '' };
    }
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'id',
      header: 'Payment ID',
      cell: ({ row }) => (
        <button
          onClick={() => setSelectedPayment(row.original)}
          className="text-left font-mono font-medium text-yellow-400 hover:underline text-xs"
        >
          {row.original.id}
        </button>
      ),
    },
    {
      accessorKey: 'booking',
      header: 'Booking / Customer',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/rides?search=${row.original.bookingNumber}`}
            className="text-xs font-semibold text-white hover:text-yellow-400 flex items-center gap-1"
          >
            {row.original.bookingNumber}
            <ExternalLink className="h-3 w-3 text-zinc-500" />
          </Link>
          <span className="text-xs text-zinc-400 mt-0.5">{row.original.customerName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount / Paid / Due',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white">{formatCurrency(row.original.amount)}</span>
          <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
            <span className="text-green-400" title="Advance / Paid">{formatCurrency(row.original.advancePaid)}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400" title="Remaining Due">{formatCurrency(row.original.remainingDue)}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'method',
      header: 'Method & Gateway',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-zinc-200">{row.original.paymentMethod}</span>
          <span className="text-[10px] text-zinc-500">{row.original.gateway}</span>
        </div>
      ),
    },
    {
      accessorKey: 'paymentDate',
      header: 'Date & Time',
      cell: ({ row }) => {
        const { date, time } = formatDate(row.original.paymentDate);
        return (
          <div className="flex flex-col text-xs">
            <span className="text-zinc-300">{date}</span>
            <span className="text-[10px] text-zinc-500">{time}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedPayment(row.original)}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            View
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md p-0 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-zinc-300 w-44">
              <DropdownMenuItem
                onClick={() => setSelectedPayment(row.original)}
                className="hover:bg-zinc-900 cursor-pointer text-xs"
              >
                <Eye className="mr-2 h-3.5 w-3.5 text-yellow-400" />
                Payment Details
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  toast.success(`Receipt for ${row.original.bookingNumber} downloaded.`);
                }}
                className="hover:bg-zinc-900 cursor-pointer text-xs"
              >
                <Receipt className="mr-2 h-3.5 w-3.5" />
                Receipt Details
              </DropdownMenuItem>
              
              {(row.original.status === 'Paid' || row.original.status === 'Advance Paid') && (
                <>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={() => handleRefund(row.original.id, row.original.amount)}
                    className="text-orange-400 hover:bg-orange-500/10 cursor-pointer text-xs"
                  >
                    <CornerDownLeft className="mr-2 h-3.5 w-3.5" />
                    Issue Refund
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="rounded-xl border border-white/10 bg-zinc-950 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-900/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-zinc-400 font-medium text-xs h-11 whitespace-nowrap">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/10">
                    {columns.map((col, j) => (
                      <TableCell key={j} className="h-14">
                        <Skeleton className="h-4 w-full max-w-[120px] bg-zinc-800 rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-white/10 hover:bg-zinc-900/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 whitespace-nowrap text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CreditCard className="h-8 w-8 text-zinc-600" />
                      <p className="text-sm font-medium text-zinc-300">No payment transactions found.</p>
                      <p className="text-xs text-zinc-500">Recorded payments and rides will show here.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Payment Details Dialog */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
          <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-400 text-lg">
                <Receipt className="h-5 w-5" />
                Payment Transaction Receipt
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-xs">
                Transaction ID: <span className="font-mono text-zinc-300">{selectedPayment.id}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Total Transaction Amount</span>
                  <span className="text-lg font-bold text-white">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Advance Paid</span>
                  <span className="text-green-400 font-medium">
                    {formatCurrency(selectedPayment.advancePaid)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Remaining Balance Due</span>
                  <span className="text-red-400 font-medium">
                    {formatCurrency(selectedPayment.remainingDue)}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 px-1">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Payment Status</span>
                  <PaymentStatusBadge status={selectedPayment.status} />
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Booking Number</span>
                  <Link
                    href={`/rides?search=${selectedPayment.bookingNumber}`}
                    className="font-mono text-yellow-400 hover:underline flex items-center gap-1"
                  >
                    {selectedPayment.bookingNumber}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Customer Name</span>
                  <span className="font-medium text-white">{selectedPayment.customerName}</span>
                </div>
                {selectedPayment.driverName && selectedPayment.driverName !== 'N/A' && (
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-400">Driver Assigned</span>
                    <span className="font-medium text-zinc-300">{selectedPayment.driverName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Payment Method</span>
                  <span className="font-semibold text-white">{selectedPayment.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Gateway / Process</span>
                  <span className="font-medium text-zinc-300">{selectedPayment.gateway}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Transaction Date</span>
                  <span className="text-zinc-300">
                    {formatDate(selectedPayment.paymentDate).date} at {formatDate(selectedPayment.paymentDate).time}
                  </span>
                </div>
              </div>

              {(selectedPayment.status === 'Paid' || selectedPayment.status === 'Advance Paid') && (
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      handleRefund(selectedPayment.id, selectedPayment.amount);
                      setSelectedPayment(null);
                    }}
                    variant="outline"
                    className="w-full border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-xs"
                  >
                    <CornerDownLeft className="mr-2 h-3.5 w-3.5" />
                    Issue Refund for this Payment
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
