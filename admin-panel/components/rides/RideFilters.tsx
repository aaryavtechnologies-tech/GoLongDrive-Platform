'use client';

import * as React from 'react';
import { Search, ListFilter, X, RefreshCw, Navigation, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RideFilters as FilterTypes, RideStatus, TripType, PaymentStatus } from '@/types/ride';

interface RideFiltersProps {
  filters: FilterTypes;
  onFilterChange: (filters: FilterTypes) => void;
  onRefresh: () => void;
  isFetching: boolean;
}

export function RideFilters({ filters, onFilterChange, onRefresh, isFetching }: RideFiltersProps) {
  const [searchTerm, setSearchTerm] = React.useState(filters.search || '');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFilterChange({ ...filters, search: searchTerm });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters, onFilterChange]);

  const hasActiveFilters = !!filters.search || 
    (filters.status && filters.status !== 'All') || 
    (filters.tripType && filters.tripType !== 'All') ||
    (filters.paymentStatus && filters.paymentStatus !== 'All') ||
    !!filters.date;

  const clearFilters = () => {
    setSearchTerm('');
    onFilterChange({ search: '', status: 'All', tripType: 'All', paymentStatus: 'All', date: '' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-zinc-950 p-4 rounded-lg border border-white/5 shadow-sm mb-6">
      <div className="flex flex-1 flex-col sm:flex-row flex-wrap gap-4 w-full">
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search rides, customers, drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-400"
          />
        </div>
        
        <Select 
          value={filters.status || 'All'} 
          onValueChange={(v) => onFilterChange({ ...filters, status: v as RideStatus | 'All' })}
        >
          <SelectTrigger className="w-full sm:w-[160px] bg-zinc-900 border-zinc-800 text-white">
            <div className="flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-zinc-400" />
              <SelectValue placeholder="Ride Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
            <SelectItem value="All" className="hover:bg-zinc-900">All Statuses</SelectItem>
            <SelectItem value="Pending" className="text-yellow-500">Pending</SelectItem>
            <SelectItem value="Searching Driver" className="text-orange-500">Searching Driver</SelectItem>
            <SelectItem value="Driver Assigned" className="text-blue-500">Driver Assigned</SelectItem>
            <SelectItem value="Trip Started" className="text-purple-500">Trip Started</SelectItem>
            <SelectItem value="Trip Completed" className="text-green-500">Completed</SelectItem>
            <SelectItem value="Cancelled by Customer" className="text-red-500">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.tripType || 'All'} 
          onValueChange={(v) => onFilterChange({ ...filters, tripType: v as TripType | 'All' })}
        >
          <SelectTrigger className="w-full sm:w-[150px] bg-zinc-900 border-zinc-800 text-white">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-zinc-400" />
              <SelectValue placeholder="Trip Type" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
            <SelectItem value="All" className="hover:bg-zinc-900">All Types</SelectItem>
            <SelectItem value="One Way">One Way</SelectItem>
            <SelectItem value="Round Trip">Round Trip</SelectItem>
            <SelectItem value="Airport Drop">Airport Drop</SelectItem>
            <SelectItem value="Airport Pickup">Airport Pickup</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.paymentStatus || 'All'} 
          onValueChange={(v) => onFilterChange({ ...filters, paymentStatus: v as PaymentStatus | 'All' })}
        >
          <SelectTrigger className="w-full sm:w-[160px] bg-zinc-900 border-zinc-800 text-white">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-zinc-400" />
              <SelectValue placeholder="Payment" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
            <SelectItem value="All" className="hover:bg-zinc-900">All Payments</SelectItem>
            <SelectItem value="Pending" className="text-yellow-500">Pending</SelectItem>
            <SelectItem value="Advance Paid" className="text-blue-500">Advance Paid</SelectItem>
            <SelectItem value="Paid" className="text-green-500">Paid</SelectItem>
            <SelectItem value="Failed" className="text-red-500">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filters.date || ''}
          onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
          className="w-full sm:w-[160px] bg-zinc-900 border-zinc-800 text-white focus-visible:ring-yellow-400"
          title="Pickup Date"
        />
      </div>
      
      <div className="flex items-center gap-2 w-full lg:w-auto justify-end mt-4 lg:mt-0">
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={onRefresh} 
          disabled={isFetching}
          className="bg-transparent border-white/10 text-white hover:bg-zinc-900"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
