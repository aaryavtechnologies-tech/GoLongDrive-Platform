'use client';

import { Driver } from '@/types/driver';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DriverStatusBadge } from './DriverStatusBadge';
import { AvailabilityBadge } from './AvailabilityBadge';
import { Mail, Phone, MapPin, Calendar, User, UserCircle2, Briefcase, PhoneCall } from 'lucide-react';
import { format } from 'date-fns';

export function DriverProfile({ driver }: { driver: Driver }) {
  return (
    <Card className="bg-zinc-950 border-white/5 text-white shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Driver Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32 border-4 border-zinc-900 shadow-xl">
              <AvatarImage src={driver.avatar} alt={driver.name} />
              <AvatarFallback className="bg-zinc-800 text-zinc-400 text-4xl">
                {driver.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2">
              <DriverStatusBadge status={driver.status} />
              <AvailabilityBadge availability={driver.availability} />
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 w-full">
            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Full Name</span>
              <div className="flex items-center gap-2 font-medium">
                <User className="h-4 w-4 text-zinc-400" />
                {driver.name}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Driver ID</span>
              <div className="flex items-center gap-2 font-medium text-zinc-300">
                <UserCircle2 className="h-4 w-4 text-zinc-400" />
                {driver.id}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Email Address</span>
              <div className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4 text-zinc-400" />
                {driver.email}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Phone Number</span>
              <div className="flex items-center gap-2 font-medium">
                <Phone className="h-4 w-4 text-zinc-400" />
                {driver.phone}
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-sm text-zinc-500">Address</span>
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                <span className="truncate">{driver.address}, {driver.city}, {driver.state} - {driver.pincode}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Emergency Contact</span>
              <div className="flex items-center gap-2 font-medium text-orange-400">
                <PhoneCall className="h-4 w-4" />
                {driver.emergencyContact}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Experience</span>
              <div className="flex items-center gap-2 font-medium">
                <Briefcase className="h-4 w-4 text-zinc-400" />
                {driver.experience}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Registered On</span>
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-zinc-400" />
                {format(new Date(driver.joinedDate), 'MMMM dd, yyyy')}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Date of Birth</span>
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-zinc-400" />
                {format(new Date(driver.dateOfBirth), 'MMMM dd, yyyy')}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
