'use client';

import * as React from 'react';
import { Search, ListFilter, X, RefreshCw, Car } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DriverFilters as FilterTypes, DriverApprovalStatus, DriverAvailability } from '@/types/driver';

interface DriverFiltersProps {
  filters: FilterTypes;
  onFilterChange: (filters: FilterTypes) => void;
  onRefresh: () => void;
  isFetching: boolean;
}

export function DriverFilters({ filters, onFilterChange, onRefresh, isFetching }: DriverFiltersProps) {
  const [searchTerm, setSearchTerm] = React.useState(filters.search || '');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFilterChange({ ...filters, search: searchTerm });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters, onFilterChange]);

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value as DriverApprovalStatus | 'All' });
  };

  const handleAvailabilityChange = (value: string) => {
    onFilterChange({ ...filters, availability: value as DriverAvailability | 'All' });
  };

  const hasActiveFilters = !!filters.search || 
    (filters.status && filters.status !== 'All') || 
    (filters.availability && filters.availability !== 'All');

  const clearFilters = () => {
    setSearchTerm('');
    onFilterChange({ search: '', status: 'All', availability: 'All', vehicleType: 'All' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-zinc-950 p-4 rounded-lg border border-white/5 shadow-sm mb-6">
      <div className="flex flex-1 flex-col sm:flex-row flex-wrap gap-4 w-full">
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search drivers, phone, vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-400"
          />
        </div>
        
        <Select value={filters.status || 'All'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[170px] bg-zinc-900 border-zinc-800 text-white">
            <div className="flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-zinc-400" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
            <SelectItem value="All" className="hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white">All Statuses</SelectItem>
            <SelectItem value="Approved" className="text-green-500 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-green-500">Approved</SelectItem>
            <SelectItem value="Pending" className="text-yellow-500 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-yellow-500">Pending</SelectItem>
            <SelectItem value="Documents Submitted" className="text-blue-500 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-blue-500">Docs Submitted</SelectItem>
            <SelectItem value="Under Review" className="text-purple-500 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-purple-500">Under Review</SelectItem>
            <SelectItem value="Suspended" className="text-orange-500 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-orange-500">Suspended</SelectItem>
            <SelectItem value="Rejected" className="text-red-500 hover:bg-zinc-900 focus:bg-zinc-900 focus:text-red-500">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.availability || 'All'} onValueChange={handleAvailabilityChange}>
          <SelectTrigger className="w-full sm:w-[150px] bg-zinc-900 border-zinc-800 text-white">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-zinc-400" />
              <SelectValue placeholder="Availability" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
            <SelectItem value="All" className="hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white">All Availabilities</SelectItem>
            <SelectItem value="Online" className="hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white">Online</SelectItem>
            <SelectItem value="Offline" className="hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white">Offline</SelectItem>
            <SelectItem value="Busy" className="hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white">Busy</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
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
