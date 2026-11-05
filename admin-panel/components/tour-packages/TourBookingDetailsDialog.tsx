'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  Mail,
  User,
  Calendar,
  Users,
  MapPin,
  Clock,
  Car,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { TourBooking, tourPackageService } from '@/services/tour-package.service';

interface TourBookingDetailsDialogProps {
  booking: TourBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignDriver: (bookingId: string, bookingNumber: string) => void;
  onRefresh: () => void;
}

export function TourBookingDetailsDialog({
  booking,
  isOpen,
  onClose,
  onAssignDriver,
  onRefresh,
}: TourBookingDetailsDialogProps) {
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!booking) return null;

  const customerName = booking.customer?.fullName || 'Guest Customer';
  const customerPhone = booking.customer?.phoneNumber || 'No phone provided';
  const customerEmail = booking.customer?.email || 'No email provided';

  const handleCopyPhone = () => {
    if (booking.customer?.phoneNumber) {
      navigator.clipboard.writeText(booking.customer.phoneNumber);
      toast.success('Phone number copied to clipboard');
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await tourPackageService.confirmBooking(
        booking._id,
        'Admin verified customer details via phone call and confirmed booking.'
      );
      toast.success('Tour booking confirmed! You can now assign a driver.');
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Failed to confirm booking');
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      await tourPackageService.cancelBooking(booking._id, 'Customer requested cancellation on call');
      toast.success('Booking marked as cancelled');
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const isPending = booking.rideStatus === 'Pending';
  const isConfirmed = booking.rideStatus === 'Confirmed';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Tour Booking #{booking.bookingId}
            </DialogTitle>
            <Badge
              className={`text-xs capitalize font-semibold ${
                booking.rideStatus === 'Confirmed'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : booking.rideStatus === 'Driver Assigned' || booking.rideStatus === 'Driver Accepted'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : booking.rideStatus === 'Pending'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {booking.rideStatus}
            </Badge>
          </div>
          <DialogDescription className="text-zinc-400">
            Created on {new Date(booking.createdAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Customer Contact Details Banner */}
          <div className="p-4 rounded-xl bg-yellow-400/10 border border-yellow-400/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                Customer Contact Details
              </span>
              <span className="text-xs text-zinc-400">Call to verify itinerary</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-white">
                <User className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold">{customerName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-300 truncate">{customerEmail}</span>
              </div>

              <div className="flex items-center gap-2 sm:col-span-2 bg-black/40 p-2.5 rounded-lg border border-yellow-400/30">
                <Phone className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-base font-bold text-yellow-300">{customerPhone}</span>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                    title="Copy phone"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`tel:${customerPhone}`}
                    className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-xs rounded-md shadow flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    Call Now
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <h4 className="text-sm font-semibold text-white">Tour Package</h4>
            <p className="text-base font-bold text-yellow-400">
              {booking.tourPackage?.title || 'Custom Tour Package'}
            </p>
            {booking.tourPackage?.route && (
              <p className="text-xs text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                Route: {booking.tourPackage.route}
              </p>
            )}
            {booking.tourPackage?.days && (
              <p className="text-xs text-zinc-400">
                Duration: {booking.tourPackage.days} Days / {booking.tourPackage.nights || 0} Nights
              </p>
            )}
          </div>

          {/* Travel Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Travel Date & Time
              </span>
              <p className="font-semibold text-white mt-1">
                {new Date(booking.pickupDate).toLocaleDateString()} at {booking.pickupTime}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Travelers
              </span>
              <p className="font-semibold text-white mt-1">
                {booking.numberOfPassengers} Persons
              </p>
            </div>
          </div>

          {/* Fare & Payment */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400">Total Package Fare</span>
              <p className="text-2xl font-bold text-white">
                ₹{(booking.finalFare || booking.estimatedFare || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400">Payment Mode</span>
              <p className="text-sm font-semibold text-yellow-400">
                {booking.paymentMethod} ({booking.paymentStatus})
              </p>
            </div>
          </div>

          {/* Assigned Driver (if any) */}
          {booking.driver ? (
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-yellow-400/10 text-yellow-400 flex items-center justify-center font-bold">
                  {booking.driver.fullName?.charAt(0) || 'D'}
                </div>
                <div>
                  <span className="text-xs text-zinc-400">Assigned Driver</span>
                  <p className="text-sm font-bold text-white">{booking.driver.fullName}</p>
                  <p className="text-xs text-zinc-400">{booking.driver.phoneNumber}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAssignDriver(booking._id, booking.bookingId)}
                className="border-zinc-700 text-xs text-zinc-300 hover:text-white"
              >
                Change Driver
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-dashed border-zinc-800 text-center text-xs text-zinc-400">
              No driver assigned yet. Confirm booking with the customer first, then assign an available driver.
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-zinc-800">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={cancelling}
            onClick={handleCancel}
            className="sm:mr-auto text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
          >
            {cancelling ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
            Cancel Booking
          </Button>

          {isPending && (
            <Button
              type="button"
              disabled={confirming}
              onClick={handleConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
            >
              {confirming ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              )}
              Confirm Booking (Phone Call Done)
            </Button>
          )}

          {(isConfirmed || isPending) && (
            <Button
              type="button"
              onClick={() => onAssignDriver(booking._id, booking.bookingId)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-xs shadow-[0_0_15px_rgba(250,204,21,0.2)]"
            >
              <Car className="w-3.5 h-3.5 mr-1" />
              {booking.driver ? 'Reassign Driver' : 'Assign Driver'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

