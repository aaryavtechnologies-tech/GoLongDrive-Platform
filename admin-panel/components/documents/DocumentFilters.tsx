'use client';

import * as React from 'react';
import { Search, ListFilter, X, RefreshCw, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DocumentFilters as FilterTypes, DocumentStatus } from '@/types/document';

interface DocumentFiltersProps {
  filters: FilterTypes;
  onFilterChange: (filters: FilterTypes) => void;
  onRefresh: () => void;
  isFetching: boolean;
}

export function DocumentFilters({ filters, onFilterChange, onRefresh, isFetching }: DocumentFiltersProps) {
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
    (filters.type && filters.type !== 'All');

  const clearFilters = () => {
    setSearchTerm('');
    onFilterChange({ search: '', status: 'All', type: 'All', city: 'All' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-zinc-950 p-4 rounded-lg border border-white/5 shadow-sm mb-6">
      <div className="flex flex-1 flex-col sm:flex-row flex-wrap gap-4 w-full">
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search driver, ID, vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-400"
          />
        </div>
        
        <Select 
          value={filters.status || 'All'} 
          onValueChange={(v) => onFilterChange({ ...filters, status: v as DocumentStatus | 'All' })}
        >
          <SelectTrigger className="w-full sm:w-[170px] bg-zinc-900 border-zinc-800 text-white">
            <div className="flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-zinc-400" />
              <SelectValue placeholder="Verification Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
            <SelectItem value="All" className="hover:bg-zinc-900">All Statuses</SelectItem>
            <SelectItem value="Pending" className="text-yellow-500">Pending</SelectItem>
            <SelectItem value="Submitted" className="text-blue-500">Submitted</SelectItem>
            <SelectItem value="Under Review" className="text-purple-500">Under Review</SelectItem>
            <SelectItem value="Approved" className="text-green-500">Approved</SelectItem>
            <SelectItem value="Rejected" className="text-red-500">Rejected</SelectItem>
            <SelectItem value="Expired" className="text-orange-500">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.type || 'All'} 
          onValueChange={(v) => onFilterChange({ ...filters, type: v === 'All' ? 'All' : v })}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-zinc-900 border-zinc-800 text-white">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-zinc-400" />
              <SelectValue placeholder="Document Type" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
            <SelectItem value="All" className="hover:bg-zinc-900">All Types</SelectItem>
            <SelectItem value="Profile Photo">Profile Photo</SelectItem>
            <SelectItem value="Aadhaar Front">Aadhaar Front</SelectItem>
            <SelectItem value="Aadhaar Back">Aadhaar Back</SelectItem>
            <SelectItem value="Driving License Front">DL Front</SelectItem>
            <SelectItem value="Driving License Back">DL Back</SelectItem>
            <SelectItem value="RC Front">RC Front</SelectItem>
            <SelectItem value="RC Back">RC Back</SelectItem>
            <SelectItem value="Insurance Certificate">Insurance</SelectItem>
            <SelectItem value="PUC Certificate">PUC</SelectItem>
          </SelectContent>
        </Select>
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
