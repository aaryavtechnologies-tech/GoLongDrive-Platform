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
import { useUpdateDocumentStatus, useBulkUpdateDocuments } from '@/hooks/useDocumentActions';
import { FileCheck2 } from 'lucide-react';

interface ApproveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  documentIds?: string[];
  isBulk?: boolean;
}

export function ApproveDialog({ isOpen, onClose, documentId, documentIds, isBulk }: ApproveDialogProps) {
  const updateStatus = useUpdateDocumentStatus();
  const bulkUpdate = useBulkUpdateDocuments();

  const isPending = isBulk ? bulkUpdate.isPending : updateStatus.isPending;

  const handleApprove = () => {
    if (isBulk && documentIds) {
      bulkUpdate.mutate(
        { ids: documentIds, status: 'Approved' },
        { onSuccess: onClose }
      );
    } else if (documentId) {
      updateStatus.mutate(
        { id: documentId, status: 'Approved' },
        { onSuccess: onClose }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-500">
            <FileCheck2 className="h-5 w-5" />
            {isBulk ? 'Approve Multiple Documents' : 'Approve Document'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 mt-2">
            {isBulk 
              ? `Are you sure you want to approve ${documentIds?.length} selected documents?`
              : 'Are you sure you want to mark this document as approved?'
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-zinc-900" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white" 
            onClick={handleApprove}
            disabled={isPending}
          >
            {isPending ? 'Approving...' : 'Confirm Approval'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
