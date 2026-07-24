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
import { Coupon } from '@/types/coupon';
import { CouponStatusBadge } from './FinanceStatusBadges';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CheckCircle, MoreHorizontal, Edit, Trash2, Ban } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useUpdateCouponStatus, useDeleteCoupon } from '@/hooks/useFinanceActions';
import { toast } from 'sonner';

interface CouponsTableProps {
  data: Coupon[];
  isLoading: boolean;
  onEdit: (coupon: Coupon) => void;
}

export function CouponsTable({ data, isLoading, onEdit }: CouponsTableProps) {
  const updateStatus = useUpdateCouponStatus();
  const deleteCoupon = useDeleteCoupon();

  const handleStatusUpdate = (id: string, status: 'Active' | 'Inactive') => {
    updateStatus.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      deleteCoupon.mutate(id);
    }
  };

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: 'code',
      header: 'Coupon Code',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-yellow-400 font-mono tracking-wider">{row.original.code}</span>
          <span className="text-xs text-zinc-400 mt-0.5 truncate max-w-[200px]">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: 'discount',
      header: 'Discount',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">
            {row.original.discountType === 'Flat' 
              ? `₹${row.original.discountValue}` 
              : `${row.original.discountValue}%`}
          </span>
          {row.original.maxDiscount && (
            <span className="text-[10px] text-zinc-500">Upto ₹{row.original.maxDiscount}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'usage',
      header: 'Usage',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-zinc-300">
          <span>{row.original.usageCount}</span>
          <span className="text-zinc-600">/</span>
          <span>{row.original.usageLimit || '∞'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'validity',
      header: 'Validity',
      cell: ({ row }) => (
        <div className="flex flex-col text-xs text-zinc-400">
          <span>{format(new Date(row.original.startDate), 'MMM dd, yy')}</span>
          <span className="text-zinc-600">to</span>
          <span>{format(new Date(row.original.expiryDate), 'MMM dd, yy')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <CouponStatusBadge status={row.original.status} />,
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
            <DropdownMenuItem 
              onClick={() => onEdit(row.original)}
              className="hover:bg-zinc-900 cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Coupon
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-white/10" />
            
            {row.original.status === 'Active' ? (
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate(row.original.id, 'Inactive')}
                className="text-orange-500 hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer"
              >
                <Ban className="mr-2 h-4 w-4" />
                Deactivate
              </DropdownMenuItem>
            ) : row.original.status === 'Inactive' ? (
              <DropdownMenuItem 
                onClick={() => handleStatusUpdate(row.original.id, 'Active')}
                className="text-green-500 hover:bg-green-500/10 hover:text-green-400 cursor-pointer"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            ) : null}
            
            <DropdownMenuItem 
              onClick={() => handleDelete(row.original.id)}
              className="text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently
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
                  No coupons found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
