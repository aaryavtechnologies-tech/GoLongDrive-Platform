'use client';

import { Ride } from '@/types/ride';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, Luggage, Navigation, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { RideStatusBadge } from './RideStatusBadge';

export function BookingInformationCard({ ride }: { ride: Ride }) {
  return (
    <Card className="bg-zinc-950 border-white/5 text-white shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <RideStatusBadge status={ride.status} />
      </div>
      <CardHeader className="pb-4 border-b border-white/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <Hash className="h-5 w-5 text-zinc-400" />
          Booking Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-sm text-zinc-500">Booking Number</span>
            <div className="font-medium text-white">{ride.bookingNumber}</div>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-zinc-500">Trip Type</span>
            <div className="font-medium text-white flex items-center gap-2">
              <Navigation className="h-4 w-4 text-zinc-400" />
              {ride.tripType}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-zinc-500">Pickup Date</span>
            <div className="font-medium text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-400" />
              {format(new Date(ride.pickupDate), 'MMM dd, yyyy')}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-zinc-500">Pickup Time</span>
            <div className="font-medium text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-400" />
              {ride.pickupTime}
            </div>
          </div>
          {ride.returnDate && (
            <>
              <div className="space-y-1">
                <span className="text-sm text-zinc-500">Return Date</span>
                <div className="font-medium text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  {format(new Date(ride.returnDate), 'MMM dd, yyyy')}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-zinc-500">Return Time</span>
                <div className="font-medium text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-400" />
                  {ride.returnTime}
                </div>
              </div>
            </>
          )}
          <div className="space-y-1">
            <span className="text-sm text-zinc-500">Passengers</span>
            <div className="font-medium text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-400" />
              {ride.passengers}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-zinc-500">Luggage</span>
            <div className="font-medium text-white flex items-center gap-2">
              <Luggage className="h-4 w-4 text-zinc-400" />
              {ride.luggage}
            </div>
          </div>
          {ride.specialInstructions && (
            <div className="space-y-1 col-span-2 md:col-span-4 bg-zinc-900/50 p-3 rounded-lg border border-white/5">
              <span className="text-sm text-zinc-500">Special Instructions</span>
              <p className="text-sm text-zinc-300 mt-1">{ride.specialInstructions}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
