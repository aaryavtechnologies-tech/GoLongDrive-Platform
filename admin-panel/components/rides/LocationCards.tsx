'use client';

import { Ride } from '@/types/ride';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export function LocationCards({ ride }: { ride: Ride }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
      {/* Visual connector between pickup and drop on desktop */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-zinc-800 z-0"></div>
      
      <Card className="bg-zinc-950 border-white/5 text-white shadow-md relative z-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-500 flex items-center gap-2 uppercase tracking-wider">
            <span className="flex h-6 w-6 rounded-full bg-green-500/10 items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-green-500" />
            </span>
            Pickup Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-lg leading-tight">{ride.pickupLocation.address}</p>
              {ride.pickupLocation.landmark && (
                <p className="text-sm text-zinc-400 mt-1">Landmark: {ride.pickupLocation.landmark}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <MapPin className="h-4 w-4 text-zinc-500" />
              {ride.pickupLocation.city}, {ride.pickupLocation.state} - {ride.pickupLocation.pincode}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-white/5 text-white shadow-md relative z-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-500 flex items-center gap-2 uppercase tracking-wider">
            <span className="flex h-6 w-6 rounded-full bg-red-500/10 items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-red-500" />
            </span>
            Destination Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-lg leading-tight">{ride.dropLocation.address}</p>
              {ride.dropLocation.landmark && (
                <p className="text-sm text-zinc-400 mt-1">Landmark: {ride.dropLocation.landmark}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <MapPin className="h-4 w-4 text-zinc-500" />
              {ride.dropLocation.city}, {ride.dropLocation.state} - {ride.dropLocation.pincode}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
