import { EmailSettingsForm } from '@/components/settings/EmailSettingsForm';

export default function EmailSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Email (SMTP)</h3>
        <p className="text-sm text-muted-foreground">
          Configure outgoing email settings for system notifications.
        </p>
      </div>
      <EmailSettingsForm />
    </div>
  );
}
