import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface HealthIndicatorProps {
  status?: 'Healthy' | 'Warning' | 'Critical';
  className?: string;
}

export function HealthIndicator({ status = 'Healthy', className }: HealthIndicatorProps) {
  let badgeVariant: 'default' | 'destructive' | 'outline' = 'default';
  
  if (status === 'Warning') badgeVariant = 'outline'; // Warning could be yellow/orange customized via CSS, using outline for now
  if (status === 'Critical') badgeVariant = 'destructive';

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <span className="relative flex h-3 w-3">
        {status === 'Healthy' && (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </>
        )}
        {status === 'Warning' && (
          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
        )}
        {status === 'Critical' && (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </>
        )}
      </span>
      <Badge variant={badgeVariant}>{status}</Badge>
    </div>
  );
}
