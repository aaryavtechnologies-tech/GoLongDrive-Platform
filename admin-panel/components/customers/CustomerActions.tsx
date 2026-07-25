'use client';

import * as React from 'react';
import Link from 'next/link';
import { MoreHorizontal, Eye, Edit, Ban, CheckCircle, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Customer } from '@/types/customer';
import { useUpdateCustomerStatus, useDeleteCustomer } from '@/hooks/useCustomerActions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CustomerActionsProps {
  customer: Customer;
}

export function CustomerActions({ customer }: CustomerActionsProps) {
  const [isSuspendOpen, setIsSuspendOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const updateStatus = useUpdateCustomerStatus();
  const deleteCustomer = useDeleteCustomer();

  const handleStatusChange = (newStatus: Customer['status']) => {
    updateStatus.mutate(
      { id: customer.id, status: newStatus },
      { onSuccess: () => setIsSuspendOpen(false) }
    );
  };

  const handleDelete = () => {
    deleteCustomer.mutate(customer.id, {
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
          <DropdownMenuItem className="hover:bg-zinc-900 cursor-pointer">
            <Link href={`/customers/${customer.id}`} className="flex w-full items-center">
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-zinc-900 cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit Customer
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-white/10" />
          
          {customer.status === 'Active' ? (
            <DropdownMenuItem 
              onClick={() => setIsSuspendOpen(true)}
              className="text-orange-500 hover:bg-orange-500/10 hover:text-orange-400 cursor-pointer"
            >
              <Ban className="mr-2 h-4 w-4" />
              Suspend Customer
            </DropdownMenuItem>
          ) : customer.status === 'Blocked' || customer.status === 'Inactive' ? (
            <DropdownMenuItem 
              onClick={() => handleStatusChange('Active')}
              className="text-green-500 hover:bg-green-500/10 hover:text-green-400 cursor-pointer"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Activate Customer
            </DropdownMenuItem>
          ) : null}
          
          <DropdownMenuItem 
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Customer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Suspend Dialog */}
      <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-500">
              <ShieldAlert className="h-5 w-5" />
              Suspend Customer
            </DialogTitle>
            <DialogDescription className="text-zinc-400 mt-2">
              Are you sure you want to suspend <strong>{customer.name}</strong>? They will not be able to log in or book rides until activated again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-zinc-900" onClick={() => setIsSuspendOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white" 
              onClick={() => handleStatusChange('Blocked')}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? 'Suspending...' : 'Suspend'}
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
              Delete Customer
            </DialogTitle>
            <DialogDescription className="text-zinc-400 mt-2">
              Are you sure you want to delete <strong>{customer.name}</strong>? This action cannot be undone and will permanently remove their data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-zinc-900" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={handleDelete}
              disabled={deleteCustomer.isPending}
            >
              {deleteCustomer.isPending ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
