import { DriverAvailability } from '@/types/driver';

export function AvailabilityBadge({ availability }: { availability: DriverAvailability }) {
  const getColor = () => {
    switch (availability) {
      case 'Online':
      case 'Available':
        return 'bg-green-500';
      case 'Busy':
        return 'bg-yellow-500';
      case 'Offline':
        return 'bg-zinc-500';
      default:
        return 'bg-zinc-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${getColor()} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
      <span className="text-sm font-medium text-zinc-300">{availability}</span>
    </div>
  );
}
