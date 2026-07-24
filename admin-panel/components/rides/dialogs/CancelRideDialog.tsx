'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCancelRide } from '@/hooks/useRideActions';
import { Textarea } from '@/components/ui/textarea';
import { XCircle } from 'lucide-react';

interface CancelRideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rideId: string;
}

export function CancelRideDialog({ isOpen, onClose, rideId }: CancelRideDialogProps) {
  const [reason, setReason] = React.useState('');
  const cancelRide = useCancelRide();

  const handleCancel = () => {
    cancelRide.mutate(
      { rideId, reason: reason || 'Cancelled by Admin' },
      { onSuccess: () => {
          setReason('');
          onClose();
        } 
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <XCircle className="h-5 w-5" />
            Cancel Ride {rideId}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 mt-2">
            Are you sure you want to cancel this ride? This action cannot be undone. Please provide a reason for cancellation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <Textarea 
            placeholder="Reason for cancellation (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-red-500 min-h-[100px]"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-zinc-900" onClick={onClose}>
            Keep Ride
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white" 
            onClick={handleCancel}
            disabled={cancelRide.isPending}
          >
            {cancelRide.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
