import { SystemStatusCards } from '@/components/settings/SystemStatusCards';

export default function SystemStatusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">System Status</h3>
        <p className="text-sm text-muted-foreground">
          Monitor real-time health and performance metrics of the platform.
        </p>
      </div>
      <SystemStatusCards />
    </div>
  );
}
