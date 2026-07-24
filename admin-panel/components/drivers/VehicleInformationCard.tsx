'use client';

import { Vehicle } from '@/types/driver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, CheckCircle2, ShieldAlert, FileText, Snowflake, Users } from 'lucide-react';
import { format } from 'date-fns';

export function VehicleInformationCard({ vehicle }: { vehicle: Vehicle }) {
  const isExpired = (dateString: string) => new Date(dateString) < new Date();

  return (
    <Card className="bg-zinc-950 border-white/5 text-white shadow-md">
      <CardHeader className="pb-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Car className="h-5 w-5 text-zinc-400" />
            Vehicle Information
          </CardTitle>
          <div className="bg-zinc-900 px-3 py-1 rounded text-sm font-bold tracking-widest border border-white/10">
            {vehicle.vehicleNumber}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-sm text-zinc-500">Brand & Model</span>
            <div className="font-medium text-white">{vehicle.brand} {vehicle.model}</div>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm text-zinc-500">Variant</span>
            <div className="font-medium text-white">{vehicle.variant}</div>
          </div>

          <div className="space-y-1">
            <span className="text-sm text-zinc-500">Vehicle Type</span>
            <div className="font-medium text-white">{vehicle.vehicleType}</div>
          </div>

          <div className="space-y-1">
            <span className="text-sm text-zinc-500">Fuel & Year</span>
            <div className="font-medium text-white">{vehicle.fuelType} • {vehicle.year}</div>
          </div>

          <div className="space-y-1">
            <span className="text-sm text-zinc-500">Color</span>
            <div className="font-medium text-white">{vehicle.color}</div>
          </div>

          <div className="space-y-1">
            <span className="text-sm text-zinc-500">Features</span>
            <div className="flex items-center gap-3 text-zinc-300">
              <span className="flex items-center gap-1" title="Seat Capacity">
                <Users className="h-4 w-4" /> {vehicle.seatCapacity}
              </span>
              <span className="flex items-center gap-1" title="AC">
                <Snowflake className={`h-4 w-4 ${vehicle.acAvailable ? 'text-blue-400' : 'text-zinc-600'}`} />
              </span>
              <span className="text-sm bg-zinc-900 px-2 py-0.5 rounded">{vehicle.luggageCapacity}</span>
            </div>
          </div>

          <div className="space-y-1 p-3 rounded-md bg-zinc-900/50 border border-white/5">
            <span className="text-sm text-zinc-500 flex items-center gap-1">
              <ShieldAlert className="h-4 w-4" /> Insurance Expiry
            </span>
            <div className={`font-medium flex items-center gap-2 mt-1 ${isExpired(vehicle.insuranceExpiry) ? 'text-red-500' : 'text-green-500'}`}>
              {isExpired(vehicle.insuranceExpiry) ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {format(new Date(vehicle.insuranceExpiry), 'MMM dd, yyyy')}
            </div>
          </div>

          <div className="space-y-1 p-3 rounded-md bg-zinc-900/50 border border-white/5">
            <span className="text-sm text-zinc-500 flex items-center gap-1">
              <FileText className="h-4 w-4" /> PUC Expiry
            </span>
            <div className={`font-medium flex items-center gap-2 mt-1 ${isExpired(vehicle.pucExpiry) ? 'text-red-500' : 'text-green-500'}`}>
              {isExpired(vehicle.pucExpiry) ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {format(new Date(vehicle.pucExpiry), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Temporary inline import until I refactor
import { XCircle } from 'lucide-react';
