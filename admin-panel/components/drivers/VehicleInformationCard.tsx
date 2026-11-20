'use client';

import { Vehicle } from '@/types/driver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Car, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  Snowflake, 
  Users, 
  Luggage, 
  Fuel, 
  CalendarDays, 
  AlertCircle,
  XCircle
} from 'lucide-react';
import { safeFormatDate } from '@/lib/utils';

export function VehicleInformationCard({ vehicle }: { vehicle?: Vehicle }) {
  if (!vehicle) {
    return (
      <Card className="bg-zinc-950/80 border border-white/5 backdrop-blur-md text-white shadow-xl rounded-2xl p-8 text-center">
        <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto mb-3 text-zinc-500">
          <Car className="h-7 w-7" />
        </div>
        <h4 className="text-base font-semibold text-zinc-300">No Vehicle Registered</h4>
        <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
          This driver has not linked a vehicle profile yet.
        </p>
      </Card>
    );
  }

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return false;
    return d < new Date();
  };

  const isInsuranceExp = isExpired(vehicle.insuranceExpiry);
  const isPucExp = isExpired(vehicle.pucExpiry);

  return (
    <Card className="bg-zinc-950/80 border border-white/5 backdrop-blur-md text-white shadow-xl rounded-2xl overflow-hidden hover:border-yellow-500/20 transition-all duration-300">
      <CardHeader className="pb-4 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Car className="h-4 w-4 text-yellow-400" />
            Vehicle Details
          </CardTitle>

          {/* Indian Vehicle Plate Badge */}
          {vehicle.vehicleNumber && (
            <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-black px-3 py-1 rounded-md font-mono font-bold text-sm tracking-wider shadow-sm border border-yellow-500 self-start sm:self-auto">
              <span className="text-[10px] bg-black text-yellow-400 px-1 py-0.5 rounded font-sans uppercase">IND</span>
              <span>{vehicle.vehicleNumber.toUpperCase()}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-1">
            <span className="text-xs text-zinc-500">Make & Model</span>
            <div className="font-semibold text-white text-sm flex items-center gap-2">
              <Car className="h-3.5 w-3.5 text-yellow-400" />
              <span>{vehicle.brand || 'Unknown'} {vehicle.model || ''}</span>
            </div>
          </div>
          
          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-1">
            <span className="text-xs text-zinc-500">Variant & Type</span>
            <div className="font-medium text-white text-sm">
              {vehicle.variant || 'Standard'} • <span className="text-yellow-400">{vehicle.vehicleType || 'Sedan'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-1">
            <span className="text-xs text-zinc-500">Fuel & Manufacturing Year</span>
            <div className="font-medium text-white text-sm flex items-center gap-2">
              <Fuel className="h-3.5 w-3.5 text-zinc-400" />
              <span>{vehicle.fuelType || 'Petrol'} • {vehicle.year || 'N/A'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-1">
            <span className="text-xs text-zinc-500">Exterior Color</span>
            <div className="font-medium text-white text-sm flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full border border-white/20"
                style={{ backgroundColor: vehicle.color?.toLowerCase() || '#ffffff' }}
              />
              <span>{vehicle.color || 'White'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-1">
            <span className="text-xs text-zinc-500">Cabin Amenities</span>
            <div className="flex items-center gap-3 text-zinc-300 text-xs mt-1">
              <span className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded" title="Seat Capacity">
                <Users className="h-3.5 w-3.5 text-zinc-400" /> {vehicle.seatCapacity || 4} Seats
              </span>
              <span className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded" title="Air Conditioning">
                <Snowflake className={`h-3.5 w-3.5 ${vehicle.acAvailable ? 'text-cyan-400' : 'text-zinc-600'}`} />
                {vehicle.acAvailable ? 'AC' : 'Non-AC'}
              </span>
              {vehicle.luggageCapacity && (
                <span className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded" title="Luggage">
                  <Luggage className="h-3.5 w-3.5 text-zinc-400" /> {vehicle.luggageCapacity}
                </span>
              )}
            </div>
          </div>

          {/* Insurance Card */}
          <div className={`p-3.5 rounded-xl border space-y-1.5 ${
            isInsuranceExp 
              ? 'bg-rose-500/10 border-rose-500/30' 
              : 'bg-zinc-900/40 border-white/5'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-zinc-400" /> Insurance
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                isInsuranceExp 
                  ? 'bg-rose-500/20 text-rose-300' 
                  : 'bg-emerald-500/15 text-emerald-300'
              }`}>
                {isInsuranceExp ? 'Expired' : 'Valid'}
              </span>
            </div>
            <div className="font-semibold text-xs text-white">
              {safeFormatDate(vehicle.insuranceExpiry, 'MMM dd, yyyy')}
            </div>
          </div>

          {/* PUC Card */}
          <div className={`p-3.5 rounded-xl border space-y-1.5 ${
            isPucExp 
              ? 'bg-rose-500/10 border-rose-500/30' 
              : 'bg-zinc-900/40 border-white/5'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-zinc-400" /> PUC (Pollution)
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                isPucExp 
                  ? 'bg-rose-500/20 text-rose-300' 
                  : 'bg-emerald-500/15 text-emerald-300'
              }`}>
                {isPucExp ? 'Expired' : 'Valid'}
              </span>
            </div>
            <div className="font-semibold text-xs text-white">
              {safeFormatDate(vehicle.pucExpiry, 'MMM dd, yyyy')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
