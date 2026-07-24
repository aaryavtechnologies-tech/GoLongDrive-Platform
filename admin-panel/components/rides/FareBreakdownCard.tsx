'use client';

import { Ride } from '@/types/ride';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Receipt } from 'lucide-react';
import { PaymentStatusBadge } from './PaymentStatusBadge';

export function FareBreakdownCard({ ride }: { ride: Ride }) {
  const f = ride.fareBreakdown;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="bg-zinc-950 border-white/5 text-white shadow-md">
      <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Receipt className="h-5 w-5 text-zinc-400" />
          Fare Breakdown
        </CardTitle>
        <PaymentStatusBadge status={ride.paymentStatus} />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Base Fare</span>
            <span className="font-medium text-white">{formatCurrency(f.baseFare)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Distance Fare</span>
            <span className="font-medium text-white">{formatCurrency(f.distanceFare)}</span>
          </div>

          {f.driverAllowance > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Driver Allowance</span>
              <span className="font-medium text-white">{formatCurrency(f.driverAllowance)}</span>
            </div>
          )}

          {f.nightCharge > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Night Charge</span>
              <span className="font-medium text-white">{formatCurrency(f.nightCharge)}</span>
            </div>
          )}

          {(f.parking > 0 || f.toll > 0) && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Tolls & Parking</span>
              <span className="font-medium text-white">{formatCurrency(f.parking + f.toll)}</span>
            </div>
          )}

          {f.extraCharges > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Extra Charges</span>
              <span className="font-medium text-white">{formatCurrency(f.extraCharges)}</span>
            </div>
          )}

          {f.discount > 0 && (
            <div className="flex justify-between items-center text-sm text-green-400">
              <span>Discount {f.couponCode ? `(${f.couponCode})` : ''}</span>
              <span className="font-medium">-{formatCurrency(f.discount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">GST</span>
            <span className="font-medium text-white">{formatCurrency(f.gst)}</span>
          </div>

          <div className="pt-4 border-t border-white/10 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base font-semibold text-zinc-300">Grand Total</span>
              <span className="text-xl font-bold text-yellow-400">{formatCurrency(f.grandTotal)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Advance Paid</span>
              <span className="font-medium text-zinc-300">{formatCurrency(f.advancePaid)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-zinc-500">Remaining Amount</span>
              <span className="font-medium text-zinc-300">{formatCurrency(f.remainingAmount)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
