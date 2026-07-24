'use client';

import { Ride } from '@/types/ride';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle, Car, Phone, Mail, Star, ExternalLink, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CustomerDriverCards({ ride }: { ride: Ride }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-zinc-950 border-white/5 text-white shadow-md">
        <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-zinc-400" />
            Customer Details
          </CardTitle>
          <Link href={`/customers/${ride.customer.id}`} className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
            View Profile <ExternalLink className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-zinc-800">
              <AvatarImage src={ride.customer.avatar} alt={ride.customer.name} />
              <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xl">{ride.customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <div>
                <h3 className="font-semibold text-lg">{ride.customer.name}</h3>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="flex items-center text-yellow-500"><Star className="h-3 w-3 fill-current mr-1" /> {ride.customer.rating}</span>
                  <span>•</span>
                  <span>{ride.customer.totalBookings} Bookings</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-sm text-zinc-300">
                <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-zinc-500" /> {ride.customer.phone}</span>
                <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-zinc-500" /> {ride.customer.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-950 border-white/5 text-white shadow-md">
        <CardHeader className="pb-4 border-b border-white/5 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Car className="h-5 w-5 text-zinc-400" />
            Driver Details
          </CardTitle>
          {ride.driver ? (
            <Link href={`/drivers/${ride.driver.id}`} className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
              View Profile <ExternalLink className="h-3 w-3" />
            </Link>
          ) : (
            <span className="text-xs text-orange-400 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Action Required
            </span>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {ride.driver ? (
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-zinc-800">
                <AvatarImage src={ride.driver.avatar} alt={ride.driver.name} />
                <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xl">{ride.driver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <div>
                  <h3 className="font-semibold text-lg">{ride.driver.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="flex items-center text-yellow-500"><Star className="h-3 w-3 fill-current mr-1" /> {ride.driver.rating}</span>
                    <span>•</span>
                    <span className="bg-zinc-800 px-2 py-0.5 rounded">{ride.driver.vehicle.type}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm text-zinc-300">
                  <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-zinc-500" /> {ride.driver.phone}</span>
                  <span className="flex items-center gap-2"><Car className="h-4 w-4 text-zinc-500" /> {ride.driver.vehicle.brand} {ride.driver.vehicle.model} ({ride.driver.vehicle.number})</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="bg-orange-500/10 p-3 rounded-full mb-3">
                <UserCircle className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-zinc-400 mb-4">No driver assigned to this ride yet.</p>
              {/* Note: In page.tsx we will provide the action button for assignment to keep state central or we can lift it up */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
