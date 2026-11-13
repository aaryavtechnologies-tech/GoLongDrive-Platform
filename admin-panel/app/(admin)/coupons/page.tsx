'use client';

import * as React from 'react';
import { useCoupons } from '@/hooks/useFinance';
import { CouponFilters as FilterTypes, Coupon } from '@/types/coupon';
import { CouponsTable } from '@/components/finance/CouponsTable';
import { CouponDialog } from '@/components/finance/CouponDialog';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  ListFilter,
  Ticket,
  FilterX,
  Plus,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CouponsPage() {
  const [filters, setFilters] = React.useState<FilterTypes>({ 
    search: '', 
    status: 'All' 
  });
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const limit = 10;
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [couponToEdit, setCouponToEdit] = React.useState<Coupon | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError, refetch } = useCoupons({ ...filters, page, limit });

  if (isError) {
    return <ErrorBoundary error={new Error('Failed to load promo coupons')} reset={refetch} />;
  }

  const coupons = data?.data || [];
  const hasActiveFilters = !!filters.search || filters.status !== 'All';

  // Calculate live high-level stats from loaded data
  const totalActive = coupons.filter(c => c.status === 'Active').length;
  const totalUses = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  const totalExpired = coupons.filter(c => c.status === 'Expired' || c.status === 'Inactive').length;

  const handleEdit = (coupon: Coupon) => {
    setCouponToEdit(coupon);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setCouponToEdit(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Ticket className="h-6 w-6 text-yellow-400" />
            Promo Codes & Coupons
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Create, manage and inspect promotional discounts for your passengers and tourists.
          </p>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-md shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
            <Ticket className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Total Coupons</p>
            <p className="text-xl font-bold text-white mt-0.5">{data?.total ?? coupons.length}</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Active Offers</p>
            <p className="text-xl font-bold text-green-400 mt-0.5">{totalActive}</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Total Redemptions</p>
            <p className="text-xl font-bold text-white mt-0.5">{totalUses}</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Expired / Inactive</p>
            <p className="text-xl font-bold text-zinc-300 mt-0.5">{totalExpired}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-zinc-950 p-4 rounded-xl border border-white/5 shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row flex-wrap gap-4 w-full">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-400 text-sm"
            />
          </div>
          
          <Select 
            value={filters.status || 'All'} 
            onValueChange={(v: any) => { setFilters({ ...filters, status: v }); setPage(1); }}
          >
            <SelectTrigger className="w-full sm:w-[160px] bg-zinc-900 border-zinc-800 text-white text-sm">
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-zinc-400" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Active" className="text-green-400">Active</SelectItem>
              <SelectItem value="Inactive" className="text-zinc-400">Inactive</SelectItem>
              <SelectItem value="Expired" className="text-orange-400">Expired</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchTerm('');
                setFilters({ search: '', status: 'All' });
                setPage(1);
              }}
              className="text-zinc-400 hover:text-white hover:bg-zinc-900 text-sm"
            >
              <FilterX className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Coupons Table */}
      <CouponsTable data={coupons} isLoading={isLoading} onEdit={handleEdit} />
      
      {/* Pagination */}
      {!isLoading && data && data.totalPages > 1 && (
        <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-white/5">
          <span className="text-xs text-zinc-400">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.total)} of {data.total} coupons
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="border-white/10 text-white bg-transparent hover:bg-zinc-900 text-xs h-8"
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              disabled={page === data.totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="border-white/10 text-white bg-transparent hover:bg-zinc-900 text-xs h-8"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <CouponDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        couponToEdit={couponToEdit}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
