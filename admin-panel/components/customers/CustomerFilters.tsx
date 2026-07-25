'use client';

import * as React from 'react';
import { Search, ListFilter, X, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomerFilters as FilterTypes, CustomerStatus } from '@/types/customer';

interface CustomerFiltersProps {
  filters: FilterTypes;
  onFilterChange: (filters: FilterTypes) => void;
  onRefresh: () => void;
  isFetching: boolean;
}

export function CustomerFilters({ filters, onFilterChange, onRefresh, isFetching }: CustomerFiltersProps) {
  const [searchTerm, setSearchTerm] = React.useState(filters.search || '');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFilterChange({ ...filters, search: searchTerm });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters, onFilterChange]);

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value as CustomerStatus | 'All' });
  };

  const hasActiveFilters = !!filters.search || (filters.status && filters.status !== 'All');

  const clearFilters = () => {
    setSearchTerm('');
    onFilterChange({ search: '', status: 'All' });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 p-4 rounded-lg border border-white/5 shadow-sm mb-6">
      <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-400"
          />
        </div>
        
        <Select value={filters.status || 'All'} onValueChange={(val: any) => handleStatusChange(val)}>
          <SelectTrigger className="w-full sm:w-[180px] bg-zinc-900 border-zinc-800 text-white">
            <div className="flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-zinc-400" />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
            <SelectItem value="All" className="hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white">All Statuses</SelectItem>
            <SelectItem value="Active" className="hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white text-green-500">Active</SelectItem>
            <SelectItem value="Inactive" className="hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white text-zinc-400">Inactive</SelectItem>
            <SelectItem value="Blocked" className="hover:bg-zinc-900 focus:bg-zinc-900 focus:text-white text-orange-500">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
