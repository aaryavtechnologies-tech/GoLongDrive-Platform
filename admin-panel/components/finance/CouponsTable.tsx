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
import {
  CheckCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Ban,
  Eye,
  Copy,
  Ticket,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useUpdateCouponStatus, useDeleteCoupon } from '@/hooks/useFinanceActions';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CouponsTableProps {
  data: Coupon[];
  isLoading: boolean;
  onEdit: (coupon: Coupon) => void;
}

export function CouponsTable({ data, isLoading, onEdit }: CouponsTableProps) {
  const router = useRouter();
  const updateStatus = useUpdateCouponStatus();
  const deleteCoupon = useDeleteCoupon();

  const handleStatusUpdate = (e: React.MouseEvent, id: string, status: 'Active' | 'Inactive') => {
    e.stopPropagation();
    updateStatus.mutate({ id, status });
  };

  const handleDelete = (e: React.MouseEvent, id: string, code: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete coupon "${code}"? This action cannot be undone.`)) {
      deleteCoupon.mutate(id);
    }
  };

  const copyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
  };

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: 'code',
      header: 'Coupon Code & Title',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 max-w-[240px]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-yellow-400 font-mono tracking-wider text-sm bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded">
              {row.original.code}
            </span>
            <button
              onClick={(e) => copyCode(e, row.original.code)}
              title="Copy Code"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
          <span className="text-xs text-zinc-300 font-medium truncate" title={row.original.title}>
            {row.original.title}
          </span>
          {row.original.description && (
            <span className="text-[11px] text-zinc-500 truncate" title={row.original.description}>
              {row.original.description}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'discount',
      header: 'Discount Benefit',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-white">
            {row.original.discountType === 'Flat' 
              ? `₹${row.original.discountValue.toLocaleString()}` 
              : `${row.original.discountValue}% OFF`}
          </span>
          {row.original.discountType === 'Percentage' && row.original.maxDiscount ? (
            <span className="text-[11px] text-zinc-400">Up to ₹{row.original.maxDiscount.toLocaleString()}</span>
          ) : null}
          {row.original.minBookingAmount && row.original.minBookingAmount > 0 ? (
            <span className="text-[10px] text-zinc-500">Min: ₹{row.original.minBookingAmount.toLocaleString()}</span>
          ) : (
            <span className="text-[10px] text-zinc-600">No min fare</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'usage',
      header: 'Redemptions',
      cell: ({ row }) => {
        const count = row.original.usageCount || 0;
        const limit = row.original.usageLimit;
        const percentage = limit ? Math.min(100, Math.round((count / limit) * 100)) : null;

        return (
          <div className="flex flex-col gap-1 min-w-[120px]">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span className="font-bold text-white">{count}</span>
              <span className="text-zinc-500">of {limit ? limit : '∞'} used</span>
            </div>
            {limit ? (
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    percentage && percentage >= 90 ? 'bg-red-500' : 'bg-yellow-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            ) : null}
            <span className="text-[10px] text-zinc-500">
              {row.original.usagePerCustomer || 1} use/customer
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'validity',
      header: 'Validity Period',
      cell: ({ row }) => {
        const start = row.original.startDate ? new Date(row.original.startDate) : null;
        const expiry = row.original.expiryDate ? new Date(row.original.expiryDate) : null;

        return (
          <div className="flex flex-col text-xs text-zinc-400">
            <span>{start ? format(start, 'dd MMM yyyy') : 'N/A'}</span>
            <span className="text-zinc-600 text-[10px]">to</span>
            <span className={expiry && expiry < new Date() ? 'text-red-400 font-medium' : ''}>
              {expiry ? format(expiry, 'dd MMM yyyy') : 'N/A'}
            </span>
          </div>
        );
      },
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
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/coupons/${row.original.id}`}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Details</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-zinc-300 w-44">
              <DropdownMenuItem
                onClick={() => router.push(`/coupons/${row.original.id}`)}
                className="hover:bg-zinc-900 cursor-pointer text-xs"
              >
                <Eye className="mr-2 h-3.5 w-3.5 text-yellow-400" />
                View Details & Uses
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => onEdit(row.original)}
                className="hover:bg-zinc-900 cursor-pointer text-xs"
              >
                <Edit className="mr-2 h-3.5 w-3.5" />
                Edit Coupon
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={(e) => copyCode(e, row.original.code)}
                className="hover:bg-zinc-900 cursor-pointer text-xs"
              >
                <Copy className="mr-2 h-3.5 w-3.5" />
                Copy Code
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-white/10" />
              
              {row.original.status === 'Active' ? (
                <DropdownMenuItem 
                  onClick={(e) => handleStatusUpdate(e, row.original.id, 'Inactive')}
                  className="text-orange-400 hover:bg-orange-500/10 cursor-pointer text-xs"
                >
                  <Ban className="mr-2 h-3.5 w-3.5" />
                  Deactivate
                </DropdownMenuItem>
              ) : row.original.status === 'Inactive' ? (
                <DropdownMenuItem 
                  onClick={(e) => handleStatusUpdate(e, row.original.id, 'Active')}
                  className="text-green-400 hover:bg-green-500/10 cursor-pointer text-xs"
                >
                  <CheckCircle className="mr-2 h-3.5 w-3.5" />
                  Activate
                </DropdownMenuItem>
              ) : null}
              
              <DropdownMenuItem 
                onClick={(e) => handleDelete(e, row.original.id, row.original.code)}
                className="text-red-400 hover:bg-red-500/10 cursor-pointer text-xs"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete Coupon
              </DropdownMenuItem>
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
    <div className="rounded-lg border border-white/10 bg-zinc-950 shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-900/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-zinc-400 font-medium h-11 text-xs whitespace-nowrap">
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
                      <Skeleton className="h-5 w-full max-w-[140px] bg-zinc-800 rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => router.push(`/coupons/${row.original.id}`)}
                  className="border-white/10 hover:bg-zinc-900/40 transition-colors cursor-pointer"
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
                <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Ticket className="h-8 w-8 text-zinc-600" />
                    <p className="text-sm">No promo coupons found.</p>
                    <p className="text-xs text-zinc-600">Create a coupon or adjust your search filter.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
