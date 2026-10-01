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
  pricingSettings: z.object({
    basePrice: z.coerce.number().min(0),
    pricePerKm: z.coerce.number().min(0),
    shortRideThresholdKm: z.coerce.number().min(1),
  }).optional(),
  longDistanceSettings: z.object({
    advanceAmount: z.coerce.number().min(0),
    advancePercentage: z.coerce.number().min(0).max(100),
    isPercentageBased: z.boolean(),
    minAdvanceAmount: z.coerce.number().min(0),
    allowedEarlyStartWindow: z.coerce.number().min(0),
    minBookingLeadTime: z.coerce.number().min(0),
    cancellationRules: z.string().optional(),
    refundRules: z.string().optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function GeneralSettingsForm() {
  const { settings, updateSettings, isUpdating, isLoading } = useSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      companyName: '',
      timezone: '',
      currency: '',
      pricingSettings: {
        basePrice: 2000,
        pricePerKm: 12,
        shortRideThresholdKm: 60,
      },
      longDistanceSettings: {
        advanceAmount: 500,
        advancePercentage: 20,
        isPercentageBased: false,
        minAdvanceAmount: 500,
        allowedEarlyStartWindow: 15,
        minBookingLeadTime: 2,
        cancellationRules: 'Free cancellation up to 24 hours before pickup',
        refundRules: 'Full refund if cancelled before 24 hours',
      }
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        companyName: settings.companyName || '',
        timezone: settings.timezone || 'UTC',
        currency: settings.currency || 'USD',
        pricingSettings: {
          basePrice: settings.pricingSettings?.basePrice ?? 2000,
          pricePerKm: settings.pricingSettings?.pricePerKm ?? 12,
          shortRideThresholdKm: settings.pricingSettings?.shortRideThresholdKm ?? 60,
        },
        longDistanceSettings: {
          advanceAmount: settings.longDistanceSettings?.advanceAmount ?? 500,
          advancePercentage: settings.longDistanceSettings?.advancePercentage ?? 20,
          isPercentageBased: settings.longDistanceSettings?.isPercentageBased ?? false,
          minAdvanceAmount: settings.longDistanceSettings?.minAdvanceAmount ?? 500,
          allowedEarlyStartWindow: settings.longDistanceSettings?.allowedEarlyStartWindow ?? 15,
          minBookingLeadTime: settings.longDistanceSettings?.minBookingLeadTime ?? 2,
          cancellationRules: settings.longDistanceSettings?.cancellationRules ?? 'Free cancellation up to 24 hours before pickup',
          refundRules: settings.longDistanceSettings?.refundRules ?? 'Full refund if cancelled before 24 hours',
        }
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: any) => {
    await updateSettings(data as any);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const isPercentageSelected = form.watch('longDistanceSettings.isPercentageBased') ?? false;

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

          {/* Pricing & Fare Settings */}
          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium">Pricing &amp; Fare Settings</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure per-KM rate and base price. The base price is only charged when the ride
                distance is <strong>equal to or greater than</strong> the Short Ride Threshold.
                Shorter rides are charged only the per-KM rate.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Price (₹)</label>
                <Input
                  type="number"
                  {...form.register('pricingSettings.basePrice')}
                  placeholder="e.g., 2000"
                />
                <p className="text-xs text-muted-foreground">Charged only for rides ≥ threshold KM</p>
                {(form.formState.errors as any)?.pricingSettings?.basePrice && (
                  <p className="text-sm text-destructive">{(form.formState.errors as any).pricingSettings.basePrice.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price Per KM (₹/km)</label>
                <Input
                  type="number"
                  {...form.register('pricingSettings.pricePerKm')}
                  placeholder="e.g., 12"
                />
                <p className="text-xs text-muted-foreground">Applied to every ride regardless of distance</p>
                {(form.formState.errors as any)?.pricingSettings?.pricePerKm && (
                  <p className="text-sm text-destructive">{(form.formState.errors as any).pricingSettings.pricePerKm.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Short Ride Threshold (KM)</label>
                <Input
                  type="number"
                  {...form.register('pricingSettings.shortRideThresholdKm')}
                  placeholder="e.g., 60"
                />
                <p className="text-xs text-muted-foreground">Rides below this KM → no base price</p>
                {(form.formState.errors as any)?.pricingSettings?.shortRideThresholdKm && (
                  <p className="text-sm text-destructive">{(form.formState.errors as any).pricingSettings.shortRideThresholdKm.message}</p>
                )}
              </div>
            </div>

            {/* Live preview */}
            <div className="rounded-md bg-muted/50 border p-4 text-sm space-y-1">
              <p className="font-medium text-foreground">📋 Pricing Preview</p>
              <p className="text-muted-foreground">
                Ride &lt; {form.watch('pricingSettings.shortRideThresholdKm') ?? 60} km →{' '}
                <span className="font-medium text-foreground">
                  ₹{form.watch('pricingSettings.pricePerKm') ?? 12}/km only
                </span>
              </p>
              <p className="text-muted-foreground">
                Ride ≥ {form.watch('pricingSettings.shortRideThresholdKm') ?? 60} km →{' '}
                <span className="font-medium text-foreground">
                  ₹{form.watch('pricingSettings.basePrice') ?? 2000} base + ₹{form.watch('pricingSettings.pricePerKm') ?? 12}/km
                </span>
              </p>
            </div>
          </div>

          {/* Long Distance Settings */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-medium">Long-Distance Trip Settings</h3>
            <p className="text-sm text-muted-foreground">
              Configure payment requirements, start window timings, and rules for long-distance rides.
            </p>

            <div className="flex items-center space-x-2 pb-2">
              <input
                type="checkbox"
                id="isPercentageBased"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                {...form.register('longDistanceSettings.isPercentageBased')}
              />
              <label htmlFor="isPercentageBased" className="text-sm font-medium cursor-pointer">
                Use Percentage-based Advance Payment
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Advance Amount (Flat Fee in ₹)</label>
                <Input 
                  type="number" 
                  {...form.register('longDistanceSettings.advanceAmount')} 
                  disabled={isPercentageSelected}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Advance Percentage (%)</label>
                <Input 
                  type="number" 
                  {...form.register('longDistanceSettings.advancePercentage')} 
                  disabled={!isPercentageSelected}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Advance (₹)</label>
                <Input 
                  type="number" 
                  {...form.register('longDistanceSettings.minAdvanceAmount')} 
                  disabled={!isPercentageSelected}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Allowed Early Start Window (Mins)</label>
                <Input type="number" {...form.register('longDistanceSettings.allowedEarlyStartWindow')} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Booking Lead Time (Hours)</label>
                <Input type="number" {...form.register('longDistanceSettings.minBookingLeadTime')} />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cancellation Policy Description</label>
                <Input {...form.register('longDistanceSettings.cancellationRules')} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Refund Rules Description</label>
                <Input {...form.register('longDistanceSettings.refundRules')} />
              </div>
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
