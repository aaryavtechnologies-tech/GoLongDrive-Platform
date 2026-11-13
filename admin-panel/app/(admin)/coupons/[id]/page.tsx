'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { useCouponDetails } from '@/hooks/useFinance';
import { useUpdateCouponStatus, useDeleteCoupon } from '@/hooks/useFinanceActions';
import { CouponDialog } from '@/components/finance/CouponDialog';
import { CouponStatusBadge } from '@/components/finance/FinanceStatusBadges';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Ticket,
  Copy,
  Edit,
  Trash2,
  Ban,
  CheckCircle2,
  TrendingUp,
  Users,
  IndianRupee,
  Calendar,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink,
  Percent,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CouponDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data, isLoading, isError, refetch } = useCouponDetails(id);
  const updateStatus = useUpdateCouponStatus();
  const deleteCoupon = useDeleteCoupon();

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [usageSearch, setUsageSearch] = React.useState('');

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 bg-zinc-800" />
          <Skeleton className="h-9 w-48 bg-zinc-800" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-zinc-800 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 bg-zinc-800 rounded-xl" />
          <Skeleton className="h-96 lg:col-span-2 bg-zinc-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data || !data.coupon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <Ticket className="h-12 w-12 text-zinc-600" />
        <h2 className="text-xl font-bold text-white">Coupon Not Found</h2>
        <p className="text-sm text-zinc-400 max-w-md">
          The requested coupon code may have been deleted or the ID is invalid.
        </p>
        <Link href="/coupons">
          <Button variant="outline" className="border-white/10 text-white hover:bg-zinc-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Coupons
          </Button>
        </Link>
      </div>
    );
  }

  const { coupon, usages = [], stats } = data;

  const copyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    toast.success(`Coupon code "${coupon.code}" copied to clipboard!`);
  };

  const handleToggleStatus = () => {
    const nextStatus = coupon.status === 'Active' ? 'Inactive' : 'Active';
    updateStatus.mutate(
      { id: coupon.id, status: nextStatus },
      {
        onSuccess: () => refetch(),
      }
    );
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete coupon "${coupon.code}"? This action cannot be undone.`)) {
      deleteCoupon.mutate(coupon.id, {
        onSuccess: () => {
          router.push('/coupons');
        },
      });
    }
  };

  // Filter usages by search query
  const filteredUsages = usages.filter((u) => {
    if (!usageSearch.trim()) return true;
    const q = usageSearch.toLowerCase();
    return (
      u.customerName.toLowerCase().includes(q) ||
      (u.customerPhone && u.customerPhone.toLowerCase().includes(q)) ||
      (u.customerEmail && u.customerEmail.toLowerCase().includes(q)) ||
      (u.bookingId && u.bookingId.toLowerCase().includes(q))
    );
  });

  const startDateObj = coupon.startDate ? new Date(coupon.startDate) : null;
  const expiryDateObj = coupon.expiryDate ? new Date(coupon.expiryDate) : null;
  const isExpired = expiryDateObj && expiryDateObj < new Date();

  const usageLimit = stats?.usageLimit ?? coupon.usageLimit;
  const usageCount = stats?.usageCount ?? coupon.usageCount ?? usages.length;
  const usagePercentage = usageLimit ? Math.min(100, Math.round((usageCount / usageLimit) * 100)) : null;

  return (
    <div className="space-y-6 pb-16">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/coupons">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-white/10 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-yellow-400 font-mono tracking-wider flex items-center gap-2">
                {coupon.code}
              </h1>
              <button
                onClick={copyCode}
                className="text-zinc-500 hover:text-white transition-colors"
                title="Copy Coupon Code"
              >
                <Copy className="h-4 w-4" />
              </button>
              <CouponStatusBadge status={coupon.status} />
            </div>
            <p className="text-xs text-zinc-400 mt-1">{coupon.title}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setIsEditDialogOpen(true)}
            variant="outline"
            className="border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 text-xs h-9"
          >
            <Edit className="mr-2 h-3.5 w-3.5 text-yellow-400" />
            Edit Coupon
          </Button>

          {coupon.status === 'Active' ? (
            <Button
              onClick={handleToggleStatus}
              variant="outline"
              className="border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-xs h-9"
            >
              <Ban className="mr-2 h-3.5 w-3.5" />
              Deactivate
            </Button>
          ) : (
            <Button
              onClick={handleToggleStatus}
              variant="outline"
              className="border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs h-9"
            >
              <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
              Activate
            </Button>
          )}

          <Button
            onClick={handleDelete}
            variant="outline"
            className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs h-9"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Usages Card */}
        <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Times Redeemed</span>
            <div className="h-7 w-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Ticket className="h-3.5 w-3.5 text-yellow-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white">{usageCount}</span>
              <span className="text-xs text-zinc-500">/ {usageLimit ? usageLimit : '∞'} limit</span>
            </div>
            {usageLimit ? (
              <div className="mt-2 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    usagePercentage && usagePercentage >= 90 ? 'bg-red-500' : 'bg-yellow-400'
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            ) : (
              <p className="text-[10px] text-zinc-500 mt-1">Unlimited redemptions permitted</p>
            )}
          </div>
        </div>

        {/* Total Discount Given */}
        <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Total Discount Given</span>
            <div className="h-7 w-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <IndianRupee className="h-3.5 w-3.5 text-green-400" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-green-400">
              ₹{(stats?.totalDiscountGiven ?? 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">Saved by customers</p>
          </div>
        </div>

        {/* Gross Booking Volume */}
        <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Gross Bookings</span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-white">
              ₹{(stats?.totalBookingVolume ?? 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">Revenue linked to this code</p>
          </div>
        </div>

        {/* Unique Customers */}
        <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Unique Customers</span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-purple-400" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-white">
              {stats?.uniqueCustomersCount ?? 0}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">
              Max {coupon.usagePerCustomer || 1} use/customer
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Usage History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Coupon Configuration */}
        <div className="bg-zinc-950 border border-white/10 rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <ShieldCheck className="h-4 w-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-white">Coupon Rules & Configuration</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Offer Title</span>
              <span className="font-medium text-white text-right max-w-[180px] truncate">{coupon.title}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Discount Type</span>
              <span className="font-semibold text-yellow-400">{coupon.discountType}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Discount Benefit</span>
              <span className="font-bold text-white text-sm">
                {coupon.discountType === 'Flat'
                  ? `₹${coupon.discountValue.toLocaleString()}`
                  : `${coupon.discountValue}%`}
              </span>
            </div>

            {coupon.discountType === 'Percentage' && (
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-zinc-400">Max Discount Cap</span>
                <span className="font-medium text-white">
                  {coupon.maxDiscount ? `₹${coupon.maxDiscount.toLocaleString()}` : 'No cap (Unlimited)'}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Minimum Booking Amount</span>
              <span className="font-medium text-white">
                {coupon.minBookingAmount && coupon.minBookingAmount > 0
                  ? `₹${coupon.minBookingAmount.toLocaleString()}`
                  : '₹0 (No minimum)'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Per Customer Limit</span>
              <span className="font-medium text-white">
                {coupon.usagePerCustomer || 1} time(s)
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Total Usages Allowed</span>
              <span className="font-medium text-white">
                {coupon.usageLimit ? `${coupon.usageLimit} total` : 'Unlimited'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Valid From</span>
              <span className="font-medium text-zinc-300">
                {startDateObj ? format(startDateObj, 'dd MMM yyyy') : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-zinc-400">Valid Until</span>
              <span className={`font-medium ${isExpired ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>
                {expiryDateObj ? format(expiryDateObj, 'dd MMM yyyy') : 'N/A'}
                {isExpired ? ' (Expired)' : ''}
              </span>
            </div>

            {coupon.description && (
              <div className="pt-2">
                <span className="text-zinc-400 block mb-1">Description:</span>
                <p className="text-zinc-300 text-xs bg-zinc-900/60 p-3 rounded-lg border border-white/5 leading-relaxed">
                  {coupon.description}
                </p>
              </div>
            )}

            {coupon.createdAt && (
              <div className="flex items-center justify-between pt-2 text-[10px] text-zinc-500">
                <span>Created: {format(new Date(coupon.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Usages & Customer History */}
        <div className="lg:col-span-2 bg-zinc-950 border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/5">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-yellow-400" />
                Redemption History & Used Customers ({usages.length})
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Every booking and passenger that has applied code {coupon.code}.
              </p>
            </div>

            <div className="relative w-full sm:w-[220px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <Input
                placeholder="Search customer or ID..."
                value={usageSearch}
                onChange={(e) => setUsageSearch(e.target.value)}
                className="w-full pl-8 h-8 text-xs bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-400"
              />
            </div>
          </div>

          {filteredUsages.length > 0 ? (
            <div className="rounded-lg border border-white/5 overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-900/60">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-medium text-xs h-10">Customer</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs h-10">Booking Reference</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs h-10">Booking Amount</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs h-10">Discount Applied</TableHead>
                    <TableHead className="text-zinc-400 font-medium text-xs h-10">Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsages.map((usage) => {
                    const usageDate = usage.usedAt ? new Date(usage.usedAt) : null;
                    return (
                      <TableRow key={usage.id} className="border-white/5 hover:bg-zinc-900/40 text-xs">
                        {/* Customer */}
                        <TableCell className="py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-white">{usage.customerName}</span>
                            {usage.customerPhone && (
                              <span className="text-[11px] text-zinc-400">{usage.customerPhone}</span>
                            )}
                            {usage.customerEmail && usage.customerEmail !== 'N/A' && (
                              <span className="text-[10px] text-zinc-500">{usage.customerEmail}</span>
                            )}
                          </div>
                        </TableCell>

                        {/* Booking Ref */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1.5 font-mono text-zinc-300">
                            <span>{usage.bookingId}</span>
                            {usage.bookingMongoId && (
                              <Link
                                href={`/rides?search=${usage.bookingId}`}
                                className="text-zinc-500 hover:text-yellow-400"
                                title="View in Rides"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                          {usage.bookingStatus && (
                            <span className="text-[10px] text-green-400 capitalize">
                              {usage.bookingStatus}
                            </span>
                          )}
                        </TableCell>

                        {/* Booking Amount */}
                        <TableCell className="py-3">
                          <span className="font-medium text-white">
                            ₹{(usage.bookingAmount || 0).toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Discount Given */}
                        <TableCell className="py-3">
                          <span className="font-bold text-green-400">
                            -₹{(usage.discountAmount || 0).toLocaleString()}
                          </span>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="py-3 text-zinc-400 whitespace-nowrap">
                          {usageDate ? format(usageDate, 'dd MMM yyyy, hh:mm a') : 'N/A'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-zinc-900/20 rounded-xl border border-dashed border-white/5">
              <Ticket className="h-10 w-10 text-zinc-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-300">
                  {usageSearch ? 'No matching redemption records found' : 'No redemptions yet'}
                </p>
                <p className="text-xs text-zinc-500 max-w-sm">
                  {usageSearch
                    ? 'Try clearing the search term to view all users.'
                    : `Customers have not used promo code "${coupon.code}" on any bookings yet.`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <CouponDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        couponToEdit={coupon}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

