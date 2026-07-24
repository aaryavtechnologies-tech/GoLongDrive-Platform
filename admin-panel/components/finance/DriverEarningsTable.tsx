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
import { DriverEarning } from '@/types/earning';
import { SettlementStatusBadge } from './FinanceStatusBadges';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CheckCircle, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSettleEarning } from '@/hooks/useFinanceActions';
import { toast } from 'sonner';

interface DriverEarningsTableProps {
  data: DriverEarning[];
  isLoading: boolean;
}

export function DriverEarningsTable({ data, isLoading }: DriverEarningsTableProps) {
  const settleMutation = useSettleEarning();

  const handleSettle = (id: string) => {
    if (confirm('Are you sure you want to mark these earnings as settled?')) {
      settleMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns: ColumnDef<DriverEarning>[] = [
    {
      accessorKey: 'driver',
      header: 'Driver',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link href={`/drivers/${row.original.driverId}`} className="text-sm font-medium text-yellow-400 hover:underline">
            {row.original.driverName}
          </Link>
          <span className="text-xs text-zinc-500">{row.original.driverId}</span>
        </div>
      ),
    },
    {
      accessorKey: 'completedTrips',
      header: 'Trips',
      cell: ({ row }) => <span className="font-medium text-white">{row.original.completedTrips}</span>,
    },
    {
      accessorKey: 'grossEarnings',
      header: 'Gross',
      cell: ({ row }) => <span className="text-zinc-300">{formatCurrency(row.original.grossEarnings)}</span>,
    },
    {
      accessorKey: 'deductions',
      header: 'Deductions (Comm. + Fee)',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-red-400">-{formatCurrency(row.original.commission + row.original.platformFee)}</span>
          <span className="text-xs text-zinc-500">
            {formatCurrency(row.original.commission)} + {formatCurrency(row.original.platformFee)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'netEarnings',
      header: 'Net Payout',
      cell: ({ row }) => (
        <span className="text-sm font-bold text-green-400">{formatCurrency(row.original.netEarnings)}</span>
      ),
    },
    {
      accessorKey: 'settlementStatus',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <SettlementStatusBadge status={row.original.settlementStatus} />
          {row.original.settlementDate && (
            <span className="text-[10px] text-zinc-500">{format(new Date(row.original.settlementDate), 'MMM dd')}</span>
          )}
        </div>
      ),
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
            {(row.original.settlementStatus === 'Pending' || row.original.settlementStatus === 'Processing') && (
              <DropdownMenuItem 
                onClick={() => handleSettle(row.original.id)}
                className="text-green-500 hover:bg-green-500/10 hover:text-green-400 cursor-pointer"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Settled
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="hover:bg-zinc-900 cursor-pointer">
              View Detailed Statement
            </DropdownMenuItem>
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
                  No earnings records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
