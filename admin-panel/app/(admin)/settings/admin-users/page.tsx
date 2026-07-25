import { AdminUsersTable } from '@/components/settings/AdminUsersTable';

export default function AdminUsersSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Admin Users</h3>
        <p className="text-sm text-muted-foreground">
          Manage system administrators and assign roles to control access.
        </p>
      </div>
      <AdminUsersTable />
    </div>
  );
}
