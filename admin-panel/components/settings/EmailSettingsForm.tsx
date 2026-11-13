'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { testSmtpEmail } from '@/services/settings.service';
import { Send, CheckCircle2, Mail } from 'lucide-react';

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
  const [isTesting, setIsTesting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
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

  const handleTestEmail = async () => {
    const values = form.getValues();
    if (!values.host || !values.user || !values.pass) {
      toast.error('Please enter host, username and password before testing.');
      return;
    }

    setIsTesting(true);
    try {
      const res = await testSmtpEmail({
        ...values,
        testEmail: settings?.supportEmail || values.user,
      });
      toast.success(res.message || 'SMTP verified and test email sent!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'SMTP connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-yellow-400" />
          SMTP Email Settings
        </CardTitle>
        <CardDescription>
          Configure the SMTP mail server used by GoLongDrive to deliver booking confirmations and OTPs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">SMTP Host</label>
              <Input {...form.register('host')} placeholder="smtp.gmail.com or smtp.mailgun.org" />
              {form.formState.errors.host && (
                <p className="text-xs text-red-400">{form.formState.errors.host.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SMTP Port</label>
              <Input {...form.register('port')} type="number" placeholder="587" />
              {form.formState.errors.port && (
                <p className="text-xs text-red-400">{form.formState.errors.port.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SMTP Username (Email)</label>
              <Input {...form.register('user')} placeholder="notifications@golongdrive.online" />
              {form.formState.errors.user && (
                <p className="text-xs text-red-400">{form.formState.errors.user.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SMTP Password</label>
              <Input {...form.register('pass')} type="password" placeholder="••••••••••••" />
              {form.formState.errors.pass && (
                <p className="text-xs text-red-400">{form.formState.errors.pass.message}</p>
              )}
            </div>
            <div className="flex items-center space-x-2 pt-4 md:col-span-2">
              <Checkbox 
                id="secure" 
                checked={form.watch('secure')}
                onCheckedChange={(checked) => form.setValue('secure', checked as boolean)}
              />
              <label
                htmlFor="secure"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Use SSL/TLS (Enable for Port 465, disable for Port 587 STARTTLS)
              </label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={isUpdating || isTesting}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              {isUpdating ? 'Saving...' : 'Save Email Settings'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isUpdating || isTesting}
              onClick={handleTestEmail}
              className="border-white/10 text-white hover:bg-zinc-800"
            >
              <Send className="mr-2 h-3.5 w-3.5" />
              {isTesting ? 'Testing Connection...' : 'Send Test Email'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
