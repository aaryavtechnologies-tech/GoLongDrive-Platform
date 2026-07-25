'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect } from 'react';

const formSchema = z.object({
  passwordMinLength: z.coerce.number().min(6),
  requireUppercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSymbols: z.boolean(),
  sessionTimeout: z.coerce.number().min(5),
  loginAttemptLimit: z.coerce.number().min(3),
  jwtTokenDuration: z.string(),
  refreshTokenDuration: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function SecuritySettingsForm() {
  const { settings, updateSettings, isUpdating, isLoading } = useSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passwordMinLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true,
      sessionTimeout: 60,
      loginAttemptLimit: 5,
      jwtTokenDuration: '15m',
      refreshTokenDuration: '7d',
    },
  });

  useEffect(() => {
    if (settings?.securitySettings) {
      form.reset(settings.securitySettings);
    }
  }, [settings, form]);

  const onSubmit = async (data: FormValues) => {
    await updateSettings({ securitySettings: data });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Policies</CardTitle>
        <CardDescription>
          Configure password policies and session timeouts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Password Length</label>
              <Input {...form.register('passwordMinLength')} type="number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Session Timeout (minutes)</label>
              <Input {...form.register('sessionTimeout')} type="number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Login Attempts</label>
              <Input {...form.register('loginAttemptLimit')} type="number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">JWT Token Duration</label>
              <Input {...form.register('jwtTokenDuration')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Refresh Token Duration</label>
              <Input {...form.register('refreshTokenDuration')} />
            </div>
          </div>
          
          <div className="space-y-4 pt-4">
            <h4 className="text-sm font-medium">Password Requirements</h4>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="requireUppercase" 
                checked={form.watch('requireUppercase')}
                onCheckedChange={(checked) => form.setValue('requireUppercase', checked as boolean)}
              />
              <label htmlFor="requireUppercase" className="text-sm">Require Uppercase Letter</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="requireNumbers" 
                checked={form.watch('requireNumbers')}
                onCheckedChange={(checked) => form.setValue('requireNumbers', checked as boolean)}
              />
              <label htmlFor="requireNumbers" className="text-sm">Require Numbers</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="requireSymbols" 
                checked={form.watch('requireSymbols')}
                onCheckedChange={(checked) => form.setValue('requireSymbols', checked as boolean)}
              />
              <label htmlFor="requireSymbols" className="text-sm">Require Symbols</label>
            </div>
          </div>

          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Security Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
