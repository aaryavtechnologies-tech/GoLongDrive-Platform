'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';

const formSchema = z.object({
  companyName: z.string().min(2),
  timezone: z.string(),
  currency: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function GeneralSettingsForm() {
  const { settings, updateSettings, isUpdating, isLoading } = useSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      timezone: '',
      currency: '',
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        companyName: settings.companyName || '',
        timezone: settings.timezone || 'UTC',
        currency: settings.currency || 'USD',
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: FormValues) => {
    await updateSettings(data);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Manage basic application settings like timezone and currency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Application Name</label>
            <Input {...form.register('companyName')} />
            {form.formState.errors.companyName && (
              <p className="text-sm text-destructive">{form.formState.errors.companyName.message}</p>
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <Input {...form.register('timezone')} placeholder="e.g., UTC, Asia/Kolkata" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <Input {...form.register('currency')} placeholder="e.g., USD, INR" />
            </div>
          </div>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
