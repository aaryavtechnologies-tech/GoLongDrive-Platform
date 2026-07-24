'use client';

import { Customer } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CustomerStatusBadge } from './CustomerStatusBadge';
import { Mail, Phone, MapPin, Calendar, User, UserCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export function CustomerProfile({ customer }: { customer: Customer }) {
  return (
    <Card className="bg-zinc-950 border-white/5 text-white shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Customer Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-32 w-32 border-4 border-zinc-900 shadow-xl">
              <AvatarImage src={customer.avatar} alt={customer.name} />
              <AvatarFallback className="bg-zinc-800 text-zinc-400 text-4xl">
                {customer.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CustomerStatusBadge status={customer.status} />
          </div>
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 w-full">
            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Full Name</span>
              <div className="flex items-center gap-2 font-medium">
                <User className="h-4 w-4 text-zinc-400" />
                {customer.name}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Customer ID</span>
              <div className="flex items-center gap-2 font-medium text-zinc-300">
                <UserCircle2 className="h-4 w-4 text-zinc-400" />
                {customer.id}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Email Address</span>
              <div className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4 text-zinc-400" />
                {customer.email}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Phone Number</span>
              <div className="flex items-center gap-2 font-medium">
                <Phone className="h-4 w-4 text-zinc-400" />
                {customer.phone}
              </div>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-sm text-zinc-500">Address</span>
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                <span className="truncate">{customer.address}, {customer.city}, {customer.state}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Joined Date</span>
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-zinc-400" />
                {format(new Date(customer.joinedDate), 'MMMM dd, yyyy')}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm text-zinc-500">Gender</span>
              <div className="flex items-center gap-2 font-medium">
                {customer.gender}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
