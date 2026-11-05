'use client';

import React, { useState, useEffect } from 'react';
import { Search, Car, User, Phone, CheckCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';
import { tourPackageService } from '@/services/tour-package.service';

interface AssignTourDriverDialogProps {
  bookingId: string | null;
  bookingNumber?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignTourDriverDialog({
  bookingId,
  bookingNumber,
  isOpen,
  onClose,
  onSuccess,
}: AssignTourDriverDialogProps) {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
      setSelectedDriverId(null);
      setSearch('');
    }
  }, [isOpen]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/drivers', {
        params: { status: 'approved', limit: 100 },
      });
      const list = response.data?.data?.data || response.data?.data || [];
      setDrivers(list);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!bookingId || !selectedDriverId) {
      toast.error('Please select a driver');
      return;
    }

    setSubmitting(true);
    try {
      await tourPackageService.assignDriver(bookingId, selectedDriverId);
      toast.success('Driver assigned successfully to Tour Booking');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Failed to assign driver');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = drivers.filter((d: any) => {
    const q = search.toLowerCase();
    const name = (d.fullName || d.name || '').toLowerCase();
    const phone = (d.phoneNumber || d.phone || '').toLowerCase();
    const vehicle = (d.vehicle?.vehicleType || d.vehicle?.model || '').toLowerCase();
    return name.includes(q) || phone.includes(q) || vehicle.includes(q);
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Car className="w-5 h-5 text-yellow-400" />
            Assign Driver to Booking #{bookingNumber || bookingId}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Select an approved driver for this multi-day tour package.
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by driver name, phone, or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-yellow-400"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[350px]">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-400 mr-2" />
              Loading drivers...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              No approved drivers found matching your search.
            </div>
          ) : (
            filtered.map((d: any) => {
              const driverId = d._id || d.id;
              const isSelected = selectedDriverId === driverId;
              const name = d.fullName || d.name || 'Unnamed Driver';
              const phone = d.phoneNumber || d.phone || 'No Phone';
              const vehicle = d.vehicle ? `${d.vehicle.vehicleType || ''} ${d.vehicle.model || ''} (${d.vehicle.vehicleNumber || 'No plate'})`.trim() : 'No vehicle assigned';

              return (
                <div
                  key={driverId}
                  onClick={() => setSelectedDriverId(driverId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-yellow-400 font-bold">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{name}</h4>
                      <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-zinc-500" />
                        {phone}
                      </p>
                      <p className="text-xs text-yellow-400/80 mt-0.5">{vehicle}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedDriverId || submitting}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

