import { NotificationSettingsForm } from '@/components/settings/NotificationSettingsForm';

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Configure how and when you receive alerts.
        </p>
      </div>
      <NotificationSettingsForm />
    </div>
  );
}
