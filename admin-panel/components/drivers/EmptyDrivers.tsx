'use client';

import { SearchX, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyDriversProps {
  isSearch?: boolean;
  onClearFilters?: () => void;
}

export function EmptyDrivers({ isSearch, onClearFilters }: EmptyDriversProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-950/30 rounded-lg border border-white/5 border-dashed min-h-[400px]">
      <div className="bg-zinc-900/80 p-5 rounded-full mb-5 text-zinc-500 shadow-inner">
        {isSearch ? <SearchX className="h-10 w-10 text-yellow-400/70" /> : <UserCircle className="h-10 w-10 text-yellow-400/70" />}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        {isSearch ? 'No drivers found' : 'No drivers yet'}
      </h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6">
        {isSearch 
          ? 'We couldn\'t find any drivers matching your current filters. Try adjusting your search or filters.'
          : 'You don\'t have any drivers registered in the system yet. Once they sign up, they will appear here.'}
      </p>
      {isSearch && onClearFilters && (
        <Button onClick={onClearFilters} variant="outline" className="border-white/10 text-white hover:bg-zinc-900 hover:text-white transition-colors">
          Clear all filters
        </Button>
      )}
    </div>
  );
}
