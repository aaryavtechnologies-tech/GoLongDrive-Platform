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
import { Customer } from '@/types/customer';
import { CustomerStatusBadge } from './CustomerStatusBadge';
import { CustomerActions } from './CustomerActions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerTableProps {
  data: Customer[];
  isLoading: boolean;
}

export function CustomerTable({ data, isLoading }: CustomerTableProps) {
  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-white/10">
              <AvatarImage src={customer.avatar} alt={customer.name} />
              <AvatarFallback className="bg-zinc-800 text-zinc-300">
                {customer.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-white">{customer.name}</span>
              <span className="text-xs text-zinc-500">{customer.id}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'contact',
      header: 'Contact Info',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-zinc-300">{row.original.phone}</span>
          <span className="text-xs text-zinc-500 truncate max-w-[150px]">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'city',
      header: 'Location',
      cell: ({ row }) => <span className="text-zinc-400">{row.original.city}</span>,
    },
    {
      accessorKey: 'totalBookings',
      header: 'Bookings',
      cell: ({ row }) => <span className="font-medium text-zinc-300">{row.getValue('totalBookings')}</span>,
    },
    {
      accessorKey: 'totalSpending',
      header: 'Spending',
      cell: ({ row }) => <span className="font-medium text-yellow-400">₹{row.getValue('totalSpending')}</span>,
    },
    {
      accessorKey: 'joinedDate',
      header: 'Joined Date',
      cell: ({ row }) => <span className="text-sm text-zinc-400">{format(new Date(row.getValue('joinedDate')), 'MMM dd, yyyy')}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <CustomerStatusBadge status={row.getValue('status')} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => <CustomerActions customer={row.original} />,
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
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                  data-state={row.getIsSelected() && 'selected'}
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
