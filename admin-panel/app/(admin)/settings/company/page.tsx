import { CompanySettingsForm } from '@/components/settings/CompanySettingsForm';

export default function CompanySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Company Details</h3>
        <p className="text-sm text-muted-foreground">
          Manage your business information and addresses.
        </p>
      </div>
      <CompanySettingsForm />
    </div>
  );
}
