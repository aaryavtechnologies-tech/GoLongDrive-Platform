'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect } from 'react';
import { toast } from 'sonner';

const formSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().min(1, 'Port is required'),
  user: z.string().min(1, 'Username is required'),
  pass: z.string().min(1, 'Password is required'),
  secure: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function EmailSettingsForm() {
  const { settings, updateSettings, isUpdating, isLoading } = useSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: '',
      port: 587,
      user: '',
      pass: '',
      secure: false,
    },
  });

  useEffect(() => {
    if (settings?.smtpSettings) {
      form.reset({
        host: settings.smtpSettings.host || '',
        port: settings.smtpSettings.port || 587,
        user: settings.smtpSettings.user || '',
        pass: settings.smtpSettings.pass || '',
        secure: settings.smtpSettings.secure || false,
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: FormValues) => {
    await updateSettings({ smtpSettings: data });
  };

  const handleTestEmail = () => {
    // Mock test email functionality
    toast.success('Test email sent successfully! (Mocked)');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMTP Email Settings</CardTitle>
        <CardDescription>
          Configure the SMTP server for sending system emails.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">SMTP Host</label>
              <Input {...form.register('host')} placeholder="smtp.example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SMTP Port</label>
              <Input {...form.register('port')} type="number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SMTP Username</label>
              <Input {...form.register('user')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SMTP Password</label>
              <Input {...form.register('pass')} type="password" />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox 
                id="secure" 
                checked={form.watch('secure')}
                onCheckedChange={(checked) => form.setValue('secure', checked as boolean)}
              />
              <label
                htmlFor="secure"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Use SSL/TLS Encryption
              </label>
            </div>
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Email Settings'}
            </Button>
            <Button type="button" variant="outline" onClick={handleTestEmail}>
              Send Test Email
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
