'use client';

import * as React from 'react';
import Link from 'next/link';
import { MoreHorizontal, Eye, FileText, Ban, UserPlus, Navigation, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ride } from '@/types/ride';
import { AssignDriverDialog } from './dialogs/AssignDriverDialog';
import { CancelRideDialog } from './dialogs/CancelRideDialog';
import { useUpdateRideStatus } from '@/hooks/useRideActions';

interface RideActionsProps {
  ride: Ride;
}

export function RideActions({ ride }: RideActionsProps) {
  const [isAssignOpen, setIsAssignOpen] = React.useState(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  const updateStatus = useUpdateRideStatus();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-zinc-300">
          <DropdownMenuItem asChild className="hover:bg-zinc-900 cursor-pointer">
            <Link href={`/rides/${ride.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-zinc-900 cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            View Invoice
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-white/10" />

          {/* Assignment Actions */}
          {(ride.status === 'Pending' || ride.status === 'Searching Driver') && (
            <DropdownMenuItem 
              onClick={() => setIsAssignOpen(true)}
              className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 cursor-pointer"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Driver
            </DropdownMenuItem>
          )}

          {/* Status progressions for demo purposes */}
          {ride.status === 'Driver Assigned' && (
            <DropdownMenuItem 
              onClick={() => updateStatus.mutate({ id: ride.id, status: 'Confirmed' })}
              className="text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 cursor-pointer"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Ride
            </DropdownMenuItem>
          )}
          
          {ride.status === 'Confirmed' && (
            <DropdownMenuItem 
              onClick={() => updateStatus.mutate({ id: ride.id, status: 'Trip Started' })}
              className="text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 cursor-pointer"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Start Trip
            </DropdownMenuItem>
          )}

          {ride.status === 'Trip Started' && (
            <DropdownMenuItem 
              onClick={() => updateStatus.mutate({ id: ride.id, status: 'Trip Completed' })}
              className="text-green-500 hover:bg-green-500/10 hover:text-green-400 cursor-pointer"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Trip
            </DropdownMenuItem>
          )}
          
          {/* Cancel Action */}
          {!ride.status.includes('Completed') && !ride.status.includes('Cancelled') && (
            <>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                onClick={() => setIsCancelOpen(true)}
                className="text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel Ride
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AssignDriverDialog isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} rideId={ride.id} />
      <CancelRideDialog isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} rideId={ride.id} />
    </>
  );
}
