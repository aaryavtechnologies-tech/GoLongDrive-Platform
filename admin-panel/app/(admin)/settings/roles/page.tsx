import { RolesTable } from '@/components/settings/RolesTable';

export default function RolesSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Roles & Permissions</h3>
        <p className="text-sm text-muted-foreground">
          Define roles and granular permissions for admin users.
        </p>
      </div>
      <RolesTable />
    </div>
  );
}
