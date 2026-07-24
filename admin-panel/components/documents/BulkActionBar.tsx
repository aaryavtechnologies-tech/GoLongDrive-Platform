'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Download, X } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function BulkActionBar({ selectedCount, onClearSelection, onApprove, onReject }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-zinc-900 border border-white/20 shadow-2xl rounded-full px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-black font-semibold text-sm">
            {selectedCount}
          </span>
          <span className="text-zinc-200 text-sm font-medium">Selected</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white rounded-full h-8 px-3"
            onClick={onApprove}
          >
            <CheckCircle className="mr-1.5 h-4 w-4" />
            Approve All
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-full h-8 px-3"
            onClick={onReject}
          >
            <XCircle className="mr-1.5 h-4 w-4" />
            Reject All
          </Button>

          <Button 
            size="sm" 
            variant="ghost"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full h-8 px-3"
            title="Download Selected"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="pl-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800"
            onClick={onClearSelection}
            title="Clear Selection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
