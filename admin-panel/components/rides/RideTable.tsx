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
import { Ride } from '@/types/ride';
import { RideStatusBadge } from './RideStatusBadge';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { RideActions } from './RideActions';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCircle, Car, MapPin } from 'lucide-react';

interface RideTableProps {
  data: Ride[];
  isLoading: boolean;
}

export function RideTable({ data, isLoading }: RideTableProps) {
  const columns: ColumnDef<Ride>[] = [
    {
      accessorKey: 'id',
      header: 'Ride & Booking',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{row.original.id}</span>
          <span className="text-xs text-zinc-500">{row.original.bookingNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-zinc-500" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-300">{row.original.customer.name}</span>
            <span className="text-xs text-zinc-500">{row.original.customer.phone}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'driver',
      header: 'Driver & Vehicle',
      cell: ({ row }) => {
        const driver = row.original.driver;
        if (!driver) return <span className="text-xs text-zinc-500 italic">Not Assigned</span>;
        return (
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-zinc-500" />
            <div className="flex flex-col">
              <span className="text-sm text-zinc-300">{driver.name}</span>
              <span className="text-xs text-zinc-500">{driver.vehicle.type} • {driver.vehicle.number}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'route',
      header: 'Route',
      cell: ({ row }) => (
        <div className="flex flex-col max-w-[150px]">
          <span className="text-sm text-zinc-300 truncate font-medium flex items-center gap-1 text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            {row.original.pickupLocation.city}
          </span>
          <span className="text-sm text-zinc-300 truncate font-medium flex items-center gap-1 text-red-400 mt-1">
             <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            {row.original.dropLocation.city}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'schedule',
      header: 'Pickup Date & Time',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-zinc-300">{format(new Date(row.original.pickupDate), 'MMM dd, yyyy')}</span>
          <span className="text-xs text-zinc-500">{row.original.pickupTime}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Ride Status',
      cell: ({ row }) => <RideStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }) => <PaymentStatusBadge status={row.original.paymentStatus} />,
    },
    {
      accessorKey: 'fare',
      header: 'Est. Fare',
      cell: ({ row }) => <span className="font-medium text-yellow-400">₹{row.original.fareBreakdown.grandTotal}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => <RideActions ride={row.original} />,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-lg border border-white/10 bg-zinc-950 shadow-md overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <div className="overflow-x-auto relative z-10">
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
                  No rides found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
