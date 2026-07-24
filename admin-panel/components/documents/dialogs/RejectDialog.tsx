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
import { Textarea } from '@/components/ui/textarea';
import { useUpdateDocumentStatus, useBulkUpdateDocuments } from '@/hooks/useDocumentActions';
import { XCircle } from 'lucide-react';

interface RejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  documentIds?: string[];
  isBulk?: boolean;
}

export function RejectDialog({ isOpen, onClose, documentId, documentIds, isBulk }: RejectDialogProps) {
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');
  
  const updateStatus = useUpdateDocumentStatus();
  const bulkUpdate = useBulkUpdateDocuments();

  const isPending = isBulk ? bulkUpdate.isPending : updateStatus.isPending;

  // Reset state when opened
  React.useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  const handleReject = () => {
    if (!reason.trim()) {
      setError('A reason is required for rejection.');
      return;
    }

    if (isBulk && documentIds) {
      bulkUpdate.mutate(
        { ids: documentIds, status: 'Rejected', notes: reason },
        { onSuccess: onClose }
      );
    } else if (documentId) {
      updateStatus.mutate(
        { id: documentId, status: 'Rejected', notes: reason },
        { onSuccess: onClose }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <XCircle className="h-5 w-5" />
            {isBulk ? 'Reject Multiple Documents' : 'Reject Document'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 mt-2">
            {isBulk 
              ? `Provide a reason for rejecting the ${documentIds?.length} selected documents.`
              : 'Please provide a clear reason for rejecting this document so the driver can correct it.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <Textarea 
            placeholder="E.g., Document is blurry, expired, or mismatching..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-red-500 min-h-[100px]"
          />
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-zinc-900" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white" 
            onClick={handleReject}
            disabled={isPending}
          >
            {isPending ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
