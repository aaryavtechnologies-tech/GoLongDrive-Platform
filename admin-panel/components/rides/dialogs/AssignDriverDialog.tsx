'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDrivers } from '@/hooks/useDrivers';
import { useAssignDriver } from '@/hooks/useRideActions';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Car } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface AssignDriverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rideId: string;
}

export function AssignDriverDialog({ isOpen, onClose, rideId }: AssignDriverDialogProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  // We fetch available drivers only (using mock data from driver.service)
  // For simplicity, we just fetch all and filter client side for 'Approved' and 'Online'/'Available'
  const { data: driversData, isLoading } = useDrivers({ status: 'Approved', availability: 'Online', limit: 50 });
  const assignDriver = useAssignDriver();

  const drivers = driversData?.data || [];

  const filteredDrivers = drivers.filter((d: any) => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.vehicle.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = (driver: any) => {
    // Simplify driver object for ride
    const driverMini = {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      avatar: driver.avatar,
      vehicle: {
        brand: driver.vehicle.brand,
        model: driver.vehicle.model,
        number: driver.vehicle.vehicleNumber,
        type: driver.vehicle.vehicleType
      },
      status: driver.status,
      availability: driver.availability,
      rating: 4.8 // Mock rating
    };

    assignDriver.mutate(
      { rideId, driver: driverMini },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Select an available driver to assign to ride {rideId}.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4 mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by name, vehicle type, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-400"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full bg-zinc-800" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 bg-zinc-800" />
                    <Skeleton className="h-3 w-24 bg-zinc-800" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 bg-zinc-800" />
              </div>
            ))
          ) : filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver: any) => (
              <div key={driver.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 hover:border-white/10 transition-colors gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarImage src={driver.avatar} alt={driver.name} />
                    <AvatarFallback className="bg-zinc-800 text-zinc-300">{driver.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-zinc-200">{driver.name} <span className="text-xs text-zinc-500 ml-1">({driver.id})</span></h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      <span className="flex items-center gap-1"><Car className="h-3 w-3" /> {driver.vehicle.vehicleType}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {driver.city}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-yellow-400 text-black hover:bg-yellow-500 w-full sm:w-auto"
                  onClick={() => handleAssign(driver)}
                  disabled={assignDriver.isPending}
                >
                  {assignDriver.isPending ? 'Assigning...' : 'Assign'}
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-zinc-500">
              No available drivers found matching your search.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
