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
import { Eye, Receipt, MoreHorizontal, CornerDownLeft } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useRefundPayment } from '@/hooks/useFinanceActions';
import { toast } from 'sonner';

interface PaymentsTableProps {
  data: Payment[];
  isLoading: boolean;
}

export function PaymentsTable({ data, isLoading }: PaymentsTableProps) {
  const refundMutation = useRefundPayment();

  const handleRefund = (id: string) => {
    if (confirm('Are you sure you want to refund this payment?')) {
      refundMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'id',
      header: 'Payment ID',
      cell: ({ row }) => <span className="font-medium text-white">{row.original.id}</span>,
    },
    {
      accessorKey: 'booking',
      header: 'Booking / Customer',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link href={`/rides/${row.original.bookingNumber}`} className="text-sm font-medium text-yellow-400 hover:underline">
            {row.original.bookingNumber}
          </Link>
          <span className="text-xs text-zinc-500">{row.original.customerName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Total / Paid / Due',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">{formatCurrency(row.original.amount)}</span>
          <div className="flex items-center gap-2 text-xs mt-0.5">
            <span className="text-green-500" title="Paid">{formatCurrency(row.original.advancePaid)}</span>
            <span className="text-zinc-600">/</span>
            <span className="text-red-400" title="Due">{formatCurrency(row.original.remainingDue)}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'method',
      header: 'Method / Gateway',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-zinc-300">{row.original.paymentMethod}</span>
          <span className="text-xs text-zinc-500">{row.original.gateway}</span>
        </div>
      ),
    },
    {
      accessorKey: 'paymentDate',
      header: 'Date',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-zinc-300">{format(new Date(row.original.paymentDate), 'MMM dd, yyyy')}</span>
          <span className="text-xs text-zinc-500">{format(new Date(row.original.paymentDate), 'HH:mm')}</span>
        </div>
      ),
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
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-zinc-300">
            <DropdownMenuItem className="hover:bg-zinc-900 cursor-pointer">
              <Link href={`/payments/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-zinc-900 cursor-pointer">
              <Receipt className="mr-2 h-4 w-4" />
              Download Receipt
            </DropdownMenuItem>
            
            {(row.original.status === 'Paid' || row.original.status === 'Advance Paid') && (
              <>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  onClick={() => handleRefund(row.original.id)}
                  className="text-orange-500 hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer"
                >
                  <CornerDownLeft className="mr-2 h-4 w-4" />
                  Issue Refund
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-lg border border-white/10 bg-zinc-950 shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-zinc-400 font-medium h-12 whitespace-nowrap">
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
                    <TableCell key={j} className="h-16">
                      <Skeleton className="h-5 w-full max-w-[120px] bg-zinc-800 rounded" />
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
                    <TableCell key={cell.id} className="py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-zinc-500">
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
