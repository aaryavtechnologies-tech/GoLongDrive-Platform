import { SecuritySettingsForm } from '@/components/settings/SecuritySettingsForm';

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage system security policies and session timeouts.
        </p>
      </div>
      <SecuritySettingsForm />
    </div>
  );
}
