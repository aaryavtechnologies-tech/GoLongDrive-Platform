'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect } from 'react';

const formSchema = z.object({
  enableEmailNotifications: z.boolean(),
  bookingNotifications: z.boolean(),
  driverNotifications: z.boolean(),
  paymentNotifications: z.boolean(),
  documentNotifications: z.boolean(),
  systemNotifications: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function NotificationSettingsForm() {
  const { settings, updateSettings, isUpdating, isLoading } = useSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableEmailNotifications: true,
      bookingNotifications: true,
      driverNotifications: true,
      paymentNotifications: true,
      documentNotifications: true,
      systemNotifications: true,
    },
  });

  useEffect(() => {
    if (settings?.notificationSettings) {
      form.reset(settings.notificationSettings);
    }
  }, [settings, form]);

  const onSubmit = async (data: FormValues) => {
    await updateSettings({ notificationSettings: data });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose what system events you want to be notified about.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-4 border-b">
              <Checkbox 
                id="enableEmailNotifications" 
                checked={form.watch('enableEmailNotifications')}
                onCheckedChange={(checked) => form.setValue('enableEmailNotifications', checked as boolean)}
              />
              <label htmlFor="enableEmailNotifications" className="text-sm font-bold">Enable Global Email Notifications</label>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bookingNotifications" 
                  checked={form.watch('bookingNotifications')}
                  onCheckedChange={(checked) => form.setValue('bookingNotifications', checked as boolean)}
                  disabled={!form.watch('enableEmailNotifications')}
                />
                <label htmlFor="bookingNotifications" className="text-sm">Booking Updates & Reminders</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="driverNotifications" 
                  checked={form.watch('driverNotifications')}
                  onCheckedChange={(checked) => form.setValue('driverNotifications', checked as boolean)}
                  disabled={!form.watch('enableEmailNotifications')}
                />
                <label htmlFor="driverNotifications" className="text-sm">Driver Registration & Approvals</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="paymentNotifications" 
                  checked={form.watch('paymentNotifications')}
                  onCheckedChange={(checked) => form.setValue('paymentNotifications', checked as boolean)}
                  disabled={!form.watch('enableEmailNotifications')}
                />
                <label htmlFor="paymentNotifications" className="text-sm">Payment Processing & Failures</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="documentNotifications" 
                  checked={form.watch('documentNotifications')}
                  onCheckedChange={(checked) => form.setValue('documentNotifications', checked as boolean)}
                  disabled={!form.watch('enableEmailNotifications')}
                />
                <label htmlFor="documentNotifications" className="text-sm">Document Expirations</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="systemNotifications" 
                  checked={form.watch('systemNotifications')}
                  onCheckedChange={(checked) => form.setValue('systemNotifications', checked as boolean)}
                  disabled={!form.watch('enableEmailNotifications')}
                />
                <label htmlFor="systemNotifications" className="text-sm">System Alerts & Maintenance</label>
              </div>
            </div>
          </div>
          
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Preferences'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
