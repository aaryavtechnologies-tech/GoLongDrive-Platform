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
  companyEmail: z.string().email(),
  supportEmail: z.string().email(),
  supportPhone: z.string().min(5),
  whatsappNumber: z.string().optional(),
  officeAddress: z.string().min(5),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  invoicePrefix: z.string(),
  bookingPrefix: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function CompanySettingsForm() {
  const { settings, updateSettings, isUpdating, isLoading } = useSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      companyEmail: '',
      supportEmail: '',
      supportPhone: '',
      whatsappNumber: '',
      officeAddress: '',
      gstNumber: '',
      panNumber: '',
      invoicePrefix: '',
      bookingPrefix: '',
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        companyName: settings.companyName || '',
        companyEmail: settings.companyEmail || '',
        supportEmail: settings.supportEmail || '',
        supportPhone: settings.supportPhone || '',
        whatsappNumber: settings.whatsappNumber || '',
        officeAddress: settings.officeAddress || '',
        gstNumber: settings.gstNumber || '',
        panNumber: settings.panNumber || '',
        invoicePrefix: settings.invoicePrefix || 'INV-',
        bookingPrefix: settings.bookingPrefix || 'CAB-',
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: FormValues) => {
    await updateSettings(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Details</CardTitle>
        <CardDescription>
          Update your company's contact and billing information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input {...form.register('companyName')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Email</label>
              <Input {...form.register('companyEmail')} type="email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Email</label>
              <Input {...form.register('supportEmail')} type="email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Phone</label>
              <Input {...form.register('supportPhone')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">WhatsApp Number</label>
              <Input {...form.register('whatsappNumber')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Office Address</label>
              <Input {...form.register('officeAddress')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GST Number</label>
              <Input {...form.register('gstNumber')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">PAN Number</label>
              <Input {...form.register('panNumber')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice Prefix</label>
              <Input {...form.register('invoicePrefix')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Booking Prefix</label>
              <Input {...form.register('bookingPrefix')} />
            </div>
          </div>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Company Details'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
