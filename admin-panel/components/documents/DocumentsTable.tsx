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
import { Checkbox } from '@/components/ui/checkbox';
import { DriverDocumentDetails } from '@/types/document';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCircle, Car, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface DocumentsTableProps {
  data: DriverDocumentDetails[];
  isLoading: boolean;
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function DocumentsTable({ data, isLoading, rowSelection, setRowSelection }: DocumentsTableProps) {
  const columns: ColumnDef<DriverDocumentDetails>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center h-full pl-2">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && ("indeterminate" as any))}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="border-zinc-600 data-[state=checked]:bg-yellow-400 data-[state=checked]:text-black"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center h-full pl-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="border-zinc-600 data-[state=checked]:bg-yellow-400 data-[state=checked]:text-black"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'preview',
      header: 'Preview',
      cell: ({ row }) => (
        <div className="w-16 h-12 rounded overflow-hidden border border-white/10 bg-zinc-900 relative">
          <Image 
            src={row.original.url} 
            alt={row.original.type} 
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      ),
    },
    {
      accessorKey: 'driver',
      header: 'Driver',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-zinc-500" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-300">{row.original.driverName}</span>
            <span className="text-xs text-zinc-500">{row.original.driverId}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'document',
      header: 'Document & Vehicle',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">{row.original.type}</span>
          <span className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
            <Car className="h-3 w-3" /> {row.original.vehicleNumber} ({row.original.city})
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'uploadedAt',
      header: 'Uploaded Date',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-zinc-300">{format(new Date(row.original.uploadedAt), 'MMM dd, yyyy')}</span>
          <span className="text-xs text-zinc-500">{format(new Date(row.original.uploadedAt), 'HH:mm')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <DocumentStatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/documents/${row.original.id}`}>
            <Button variant="ghost" size="sm" className="h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
              <Eye className="mr-1.5 h-4 w-4" />
              Review
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800" title="Download">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    getRowId: (row) => row.id,
  });

  return (
    <div className="rounded-lg border border-white/10 bg-zinc-950 shadow-md overflow-hidden relative">
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
                  className="border-white/10 hover:bg-zinc-900/40 transition-colors data-[state=selected]:bg-zinc-900/60"
                  data-state={row.getIsSelected() && "selected"}
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
                  No documents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
