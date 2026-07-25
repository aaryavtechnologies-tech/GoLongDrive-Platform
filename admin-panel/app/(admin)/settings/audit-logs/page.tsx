import { AuditLogTable } from '@/components/settings/AuditLogTable';

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Audit Logs</h3>
        <p className="text-sm text-muted-foreground">
          Review system activities, access logs, and administrative changes.
        </p>
      </div>
      <AuditLogTable />
    </div>
  );
}
