'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  error?: Error;
  reset?: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-zinc-950/50 rounded-lg border border-white/10">
      <div className="bg-red-500/10 p-3 rounded-full mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
      <p className="text-zinc-400 max-w-md mb-6">
        {error?.message || 'An unexpected error occurred while loading this section. Please try again later.'}
      </p>
      {reset && (
        <Button onClick={reset} variant="outline" className="border-white/10 text-white hover:bg-zinc-800">
          Try again
        </Button>
      )}
    </div>
  );
}
