'use client';

import { FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center bg-zinc-950/30 rounded-lg border border-white/5 border-dashed">
      <div className="bg-zinc-900 p-4 rounded-full mb-4 text-zinc-500">
        {icon || <FileSearch className="h-8 w-8" />}
      </div>
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-yellow-400 text-black hover:bg-yellow-500">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
