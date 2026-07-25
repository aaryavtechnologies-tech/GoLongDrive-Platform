import { ProfileSettingsForm } from '@/components/settings/ProfileSettingsForm';

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Update your personal details and security settings.
        </p>
      </div>
      <ProfileSettingsForm />
    </div>
  );
}
