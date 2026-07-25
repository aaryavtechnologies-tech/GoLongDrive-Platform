import { GeneralSettingsForm } from '@/components/settings/GeneralSettingsForm';

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General</h3>
        <p className="text-sm text-muted-foreground">
          Configure the basic settings of your platform.
        </p>
      </div>
      <GeneralSettingsForm />
    </div>
  );
}
