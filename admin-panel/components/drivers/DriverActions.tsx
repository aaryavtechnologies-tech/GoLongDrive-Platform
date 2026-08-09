'use client';

import * as React from 'react';
import Link from 'next/link';
import { MoreHorizontal, Eye, Edit, Ban, CheckCircle, Trash2, ShieldAlert, FileCheck2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Driver } from '@/types/driver';
import { useUpdateDriverStatus, useDeleteDriver } from '@/hooks/useDriverActions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DriverActionsProps {
  driver: Driver;
}

export function DriverActions({ driver }: DriverActionsProps) {
  const [isSuspendOpen, setIsSuspendOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isApproveOpen, setIsApproveOpen] = React.useState(false);
  const [isRejectOpen, setIsRejectOpen] = React.useState(false);

  const updateStatus = useUpdateDriverStatus();
  const deleteDriver = useDeleteDriver();

  const handleStatusChange = (newStatus: Driver['status'], setDialogState: React.Dispatch<React.SetStateAction<boolean>>) => {
    updateStatus.mutate(
      { id: driver.id, status: newStatus },
      { onSuccess: () => setDialogState(false) }
    );
  };

  const handleDelete = () => {
    deleteDriver.mutate(driver.id, {
      onSuccess: () => setIsDeleteOpen(false),
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-zinc-300">
          <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer text-zinc-200 transition-colors">
            <Link href={`/drivers/${driver.id}`} className="w-full flex items-center">
              <Eye className="mr-2 h-4 w-4 text-blue-400" />
              View Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer text-zinc-200 transition-colors">
            <Edit className="mr-2 h-4 w-4 text-zinc-400" />
            Edit Driver
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-white/10" />

          {/* Approval Actions */}
          {(driver.status === 'Pending' || driver.status === 'Documents Submitted' || driver.status === 'Under Review') && (
            <>
              <DropdownMenuItem 
                onClick={() => setIsApproveOpen(true)}
                className="text-green-500 hover:bg-green-500/10 hover:text-green-400 cursor-pointer"
              >
                <FileCheck2 className="mr-2 h-4 w-4" />
                Approve Driver
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsRejectOpen(true)}
                className="text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Driver
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
            </>
          )}
          
          {/* Suspension Actions */}
          {driver.status === 'Approved' ? (
            <DropdownMenuItem 
              onClick={() => setIsSuspendOpen(true)}
              className="text-orange-500 hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer"
            >
              <Ban className="mr-2 h-4 w-4" />
              Suspend Driver
            </DropdownMenuItem>
          ) : driver.status === 'Suspended' ? (
            <DropdownMenuItem 
              onClick={() => handleStatusChange('Approved', setIsSuspendOpen)}
              className="text-green-500 hover:bg-green-500/10 hover:text-green-400 cursor-pointer"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Activate Driver
            </DropdownMenuItem>
          ) : null}
          
          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuItem 
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Driver
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Suspend Dialog */}
      <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-500">
              <ShieldAlert className="h-5 w-5" />
              Suspend Driver
            </DialogTitle>
            <DialogDescription className="text-zinc-400 mt-2">
              Are you sure you want to suspend <strong>{driver.name}</strong>? They will not be able to accept new rides until activated again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-zinc-900" onClick={() => setIsSuspendOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white" 
              onClick={() => handleStatusChange('Suspended', setIsSuspendOpen)}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? 'Suspending...' : 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <FileCheck2 className="h-5 w-5" />
              Approve Driver
            </DialogTitle>
            <DialogDescription className="text-zinc-400 mt-2">
              Are you sure you want to approve <strong>{driver.name}</strong>? They will be able to start accepting rides immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-zinc-900" onClick={() => setIsApproveOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white" 
              onClick={() => handleStatusChange('Approved', setIsApproveOpen)}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? 'Approving...' : 'Approve Driver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <XCircle className="h-5 w-5" />
              Reject Driver
            </DialogTitle>
            <DialogDescription className="text-zinc-400 mt-2">
              Are you sure you want to reject <strong>{driver.name}</strong>'s application? They will need to re-submit their documents.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-zinc-900" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={() => handleStatusChange('Rejected', setIsRejectOpen)}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? 'Rejecting...' : 'Reject Driver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Trash2 className="h-5 w-5" />
              Delete Driver
            </DialogTitle>
            <DialogDescription className="text-zinc-400 mt-2">
              Are you sure you want to delete <strong>{driver.name}</strong>? This action cannot be undone and will permanently remove their data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-zinc-900" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={handleDelete}
              disabled={deleteDriver.isPending}
            >
              {deleteDriver.isPending ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
